import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private readonly bucket: string;
  private readonly profileFolder: string;
  private readonly logger = new Logger(S3Service.name);

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucket = this.configService.get<string>('S3_BUCKET_NAME');
    this.profileFolder = this.configService.get<string>('S3_PROFILE_FOLDER', 'profiles');
  }

  /**
   * 画像をS3にアップロードする
   * @param file バイナリデータ
   * @param contentType MIMEタイプ
   * @returns アップロードされた画像のURL
   */
  async uploadProfileImage(file: Buffer, contentType: string): Promise<string> {
    this.logger.log(`S3アップロード開始: contentType=${contentType}`);
    
    if (!this.isValidImageContentType(contentType)) {
      this.logger.error(`無効な画像形式: ${contentType}`);
      throw new Error('Invalid image format. Only JPEG, PNG and GIF are allowed.');
    }

    const fileExtension = this.getFileExtension(contentType);
    const key = `${this.profileFolder}/${randomUUID()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    try {
      this.logger.log(`S3にアップロード: bucket=${this.bucket}, key=${key}`);
      await this.s3Client.send(command);
      const imageUrl = `https://${this.bucket}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${key}`;
      this.logger.log(`S3アップロード成功: URL=${imageUrl}`);
      return imageUrl;
    } catch (error) {
      this.logger.error(`S3アップロードエラー: ${error.message}`, error.stack);
      console.error('Error uploading file to S3:', error);
      throw new Error('Failed to upload image');
    }
  }

  /**
   * 署名付きURLを生成する
   * @param key S3オブジェクトキー
   * @param expiresIn 有効期限（秒）
   * @returns 署名付きURL
   */
  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  /**
   * S3から画像を削除する
   * @param url 画像のURL
   */
  async deleteImage(url: string): Promise<void> {
    const key = this.extractKeyFromUrl(url);
    
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error('Failed to delete image');
    }
  }

  /**
   * URLからS3キーを抽出する
   * @param url 画像のURL
   * @returns S3キー
   */
  private extractKeyFromUrl(url: string): string {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1); // 先頭の '/' を削除
  }

  /**
   * コンテンツタイプが有効な画像形式かチェックする
   * @param contentType MIMEタイプ
   * @returns 有効な場合はtrue
   */
  private isValidImageContentType(contentType: string): boolean {
    return ['image/jpeg', 'image/png', 'image/gif'].includes(contentType);
  }

  /**
   * コンテンツタイプからファイル拡張子を取得する
   * @param contentType MIMEタイプ
   * @returns ファイル拡張子
   */
  private getFileExtension(contentType: string): string {
    switch (contentType) {
      case 'image/jpeg':
        return 'jpg';
      case 'image/png':
        return 'png';
      case 'image/gif':
        return 'gif';
      default:
        return 'jpg';
    }
  }
} 