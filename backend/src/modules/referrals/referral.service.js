"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../user/entities/user.entity");
let ReferralService = class ReferralService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async generateReferralCode(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.referralCode) {
            user.referralCode = `${userId.substring(0, 8)}-${Math.random().toString(36).substr(2, 5)}`;
            await this.userRepository.save(user);
        }
        return user.referralCode;
    }
    async registerWithReferral(email, password, name, referralCode) {
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new common_1.BadRequestException('Email is already registered');
        }
        const referredBy = referralCode
            ? (await this.userRepository.findOne({ where: { referralCode } }))?.id
            : null;
        const user = this.userRepository.create({
            email,
            password,
            name,
            referredBy,
            referralCode: undefined,
            coinBalance: 0,
        });
        return this.userRepository.save(user);
    }
    async applyReferralBonus(purchasingUserId, purchaseAmount) {
        const purchasingUser = await this.userRepository.findOne({ where: { id: purchasingUserId } });
        if (!purchasingUser || !('referredBy' in purchasingUser) || !purchasingUser.referredBy)
            return;
        const referrer = await this.userRepository.findOne({ where: { id: purchasingUser.referredBy } });
        if (!referrer)
            return;
        const bonus = Math.floor(purchaseAmount * 0.01); // 1% of the purchase amount
        referrer.coinBalance += bonus;
        await this.userRepository.save(referrer);
    }
};
ReferralService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReferralService);
exports.ReferralService = ReferralService;
