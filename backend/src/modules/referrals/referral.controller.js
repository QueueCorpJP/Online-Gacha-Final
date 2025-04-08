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
exports.ReferralController = void 0;
const common_1 = require("@nestjs/common");
const referral_service_1 = require("./referral.service");
const auth_guard_1 = require("../../common/auth.guard");
const current_user_decorator_1 = require("../../common/current-user.decorator");
const user_entity_1 = require("../user/entities/user.entity");
let ReferralController = class ReferralController {
    referralService;
    constructor(referralService) {
        this.referralService = referralService;
    }
    async getReferralCode(user) {
        if (!user.id) {
            throw new Error('User ID is required');
        }
        return { referralCode: await this.referralService.generateReferralCode(user.id || "") };
    }
    async registerWithReferral(body) {
        return this.referralService.registerWithReferral(body.email, body.password, body.name, body.referralCode);
    }
    async applyReferralBonus(body) {
        await this.referralService.applyReferralBonus(body.purchasingUserId, body.purchaseAmount);
        return { message: 'Referral bonus applied successfully' };
    }
};
__decorate([
    (0, common_1.Get)('code'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ReferralController.prototype, "getReferralCode", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReferralController.prototype, "registerWithReferral", null);
__decorate([
    (0, common_1.Post)('bonus'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReferralController.prototype, "applyReferralBonus", null);
ReferralController = __decorate([
    (0, common_1.Controller)('referrals'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [referral_service_1.ReferralService])
], ReferralController);
exports.ReferralController = ReferralController;
