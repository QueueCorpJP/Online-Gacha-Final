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
exports.UserManagementService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const payment_entity_1 = require("../payments/payment.entity");
const coin_transaction_entity_1 = require("../coin/entities/coin-transaction.entity");
let UserManagementService = class UserManagementService {
    userRepository;
    paymentRepository;
    coinTransactionRepository;
    constructor(userRepository, paymentRepository, coinTransactionRepository) {
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.coinTransactionRepository = coinTransactionRepository;
    }
    async getAllUsers(page = 1, limit = 10) {
        const [users, total] = await this.userRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return {
            users: users.map(user => {
                const { password, ...userData } = user;
                return userData;
            }),
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getUserDetails(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['coinTransactions', 'payments'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const { password, ...userData } = user;
        return userData;
    }
    async updateUserStatus(userId, status) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        user.status = status;
        await this.userRepository.save(user);
        const { password, ...userData } = user;
        return userData;
    }
    async updateUserRoles(userId, roles) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        // Ensure at least one role is provided
        if (!roles.length) {
            throw new common_1.BadRequestException('User must have at least one role');
        }
        user.roles = roles;
        await this.userRepository.save(user);
        const { password, ...userData } = user;
        return userData;
    }
    async getUserTransactions(userId) {
        const transactions = await this.coinTransactionRepository.find({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' },
        });
        return transactions;
    }
    async getUserPayments(userId) {
        const payments = await this.paymentRepository.find({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' },
        });
        return payments;
    }
    async searchUsers(query) {
        const users = await this.userRepository
            .createQueryBuilder('user')
            .where('user.email ILIKE :query OR user.username ILIKE :query', {
            query: `%${query}%`,
        })
            .getMany();
        return users.map(user => {
            const { password, ...userData } = user;
            return userData;
        });
    }
    async getUserStats() {
        const totalUsers = await this.userRepository.count();
        const activeUsers = await this.userRepository.count({ where: { status: 'Active' } });
        const suspendedUsers = await this.userRepository.count({ where: { status: 'Suspended' } });
        const bannedUsers = await this.userRepository.count({ where: { status: 'Banned' } });
        return {
            total: totalUsers,
            active: activeUsers,
            suspended: suspendedUsers,
            banned: bannedUsers,
        };
    }
};
UserManagementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(2, (0, typeorm_1.InjectRepository)(coin_transaction_entity_1.CoinTransaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UserManagementService);
exports.UserManagementService = UserManagementService;
