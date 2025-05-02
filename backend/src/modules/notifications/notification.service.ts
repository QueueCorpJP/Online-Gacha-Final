import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';
import { User } from '../user/entities/user.entity';
import { LineSettings } from '../line/entities/line-settings.entity';
import { LineService } from '../line/line.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(LineSettings)
    private lineSettingsRepository: Repository<LineSettings>,
    private lineService: LineService
  ) {}

  async sendNotification(notification: { type: string; title: string; content: string }) {
    console.log("send noti")
    const type = this.mapNotificationType(notification.type);
    
    const newNotification = this.notificationRepository.create({
      title: notification.title,
      message: notification.content,
      type
    });
    
    const savedNotification = await this.notificationRepository.save(newNotification);

    // Implement actual notification sending logic based on type
    switch (type) {
      case NotificationType.IN_APP:
        // Implement in-app notification logic
        const users = await this.userRepository.find();
        for (const user of users) {
          const lineSettings = await this.lineSettingsRepository.findOne({
            where: { 
              userId: user.id,
              // isConnected: true,
              // notifications: true
            }
          });

          console.log("find user", lineSettings)


          if (lineSettings?.lineUserId) {
            console.log(lineSettings.lineUserId);
            try {
              await this.lineService.sendMessage(lineSettings.lineUserId, {
                text: `${notification.title}\n\n${notification.content}`
              });
            } catch (error) {
              console.error(`Failed to send LINE message to user ${user.id}:`, error);
            }
          }
        }
        break;
      case NotificationType.EMAIL:
        // Implement email notification logic
        break;
      case NotificationType.PUSH:
        // Implement push notification logic
        break;
      case NotificationType.LINE:
        // Implement LINE notification logic
        break;
    }

    return savedNotification;
  }

  private mapNotificationType(type: string): NotificationType {
    switch (type.toLowerCase()) {
      case 'app':
        return NotificationType.IN_APP;
      case 'email':
        return NotificationType.EMAIL;
      case 'push':
        return NotificationType.PUSH;
      case 'line':
        return NotificationType.LINE;
      default:
        return NotificationType.IN_APP;
    }
  }

  async getAllNotifications() {
    return this.notificationRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async getUserNotifications(userId: string) {
    const notifications = await this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.readByUsers', 'readByUsers')
      .orderBy('notification.createdAt', 'DESC')
      .getMany();

    return notifications.map(notification => ({
      ...notification,
      isRead: notification.readByUsers.some(user => user.id === userId)
    }));
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
      relations: ['readByUsers']
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    if (!notification.readByUsers.some(u => u.id === userId)) {
      notification.readByUsers.push(user);
      await this.notificationRepository.save(notification);
    }

    return { success: true };
  }
}
