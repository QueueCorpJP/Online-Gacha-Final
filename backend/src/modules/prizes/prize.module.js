"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrizeModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const prize_entity_1 = require("./prize.entity");
const user_entity_1 = require("../user/entities/user.entity");
const prize_service_1 = require("./prize.service");
const prize_controller_1 = require("./prize.controller");
let PrizeModule = class PrizeModule {
};
PrizeModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([prize_entity_1.Prize, user_entity_1.User])],
        providers: [prize_service_1.PrizeService],
        controllers: [prize_controller_1.PrizeController],
    })
], PrizeModule);
exports.PrizeModule = PrizeModule;
