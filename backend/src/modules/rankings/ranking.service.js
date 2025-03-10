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
exports.RankingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../user/entities/user.entity");
let RankingService = class RankingService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async getRankings(period) {
        // const dateFrom = this.getDateFromPeriod(period);
        // const rankings = await this.gachaTransactionRepository
        //   .createQueryBuilder('transaction')
        //   .select('transaction.userId', 'userId')
        //   .addSelect('SUM(transaction.amount)', 'totalSpent')
        //   .where('transaction.date >= :dateFrom', { dateFrom })
        //   .groupBy('transaction.userId')
        //   .orderBy('SUM(transaction.amount)', 'DESC')
        //   .getRawMany();
        // Enrich rankings with user information
        const enrichedRankings = [];
        // for (const rank of rankings) {
        //   const user = await this.userRepository.findOne({ where: { id: rank.userId } });
        //   if (user) {
        //     enrichedRankings.push({
        //       rank: enrichedRankings.length + 1,
        //       userId: user.id,
        //       name: `${user.firstName} ${user.lastName}`,
        //       totalSpent: rank.totalSpent,
        //     });
        //   }
        // }
        return enrichedRankings;
    }
    getDateFromPeriod(period) {
        const now = new Date();
        if (period === 'daily') {
            return new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }
        else if (period === 'weekly') {
            const weekStart = now.getDate() - now.getDay();
            return new Date(now.getFullYear(), now.getMonth(), weekStart);
        }
        else if (period === 'monthly') {
            return new Date(now.getFullYear(), now.getMonth(), 1);
        }
        throw new Error('Invalid period');
    }
};
RankingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RankingService);
exports.RankingService = RankingService;
