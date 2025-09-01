"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicantModel = void 0;
const crypto_1 = require("crypto");
const mongoose_1 = __importStar(require("mongoose"));
const ApplicantSchema = new mongoose_1.Schema({
    formId: { type: String, required: true },
    updatedBy: { type: String, require: false },
    updatedAt: { type: Date, require: false },
    applicantId: { type: String, require: true, default: crypto_1.randomUUID },
    applicantName: { type: String, required: true },
    division: { type: String, required: true },
    contact: { type: mongoose_1.Schema.Types.Mixed, required: true },
    craft: { type: String, required: true },
    classification: { type: String, required: true },
    shiftSchedule: {
        data: { type: String, require: true },
        shiftStart: { type: Date, require: true },
        shiftEnds: { type: Date, require: true },
    },
    payRate: { type: mongoose_1.Schema.Types.Mixed, require: true },
    reportDate: { type: Date, require: true },
    ownVehicle: { type: Boolean, require: true },
    rehire: { type: Boolean, require: true },
    perDiem: { type: Boolean, require: true },
    perDiemAmount: { type: Number, require: true },
    effectiveDate: { type: Date, require: true },
    notes: { type: String },
    siteRequirements: {
        safeCouncil: {
            basicPlus: { type: Boolean },
            siteSpecific: { type: Boolean },
            bottleWatch: { type: Boolean },
            fireWatch: { type: Boolean },
            confinedSpace: { type: Boolean },
            backgroundCheck: { type: Boolean },
            twicCard: { type: Boolean },
        },
        disaService: {
            urinalysis_alcohol: { type: Boolean },
            oralSwab: { type: Boolean },
            hairTest: { type: Boolean },
            pft_fitTest: { type: Boolean },
            respiratorType: {
                fullFace: { state: { type: Boolean }, data: { type: String } },
                hallFace: { state: { type: Boolean }, data: { type: String } },
                freshAirTraining: { type: Boolean },
            },
        },
        craftRequirements: {
            nccer: { type: Boolean },
            nccco: { type: Boolean },
            weldProcedures: {
                structural: { state: { type: Boolean }, data: { type: String } },
                pipe: { state: { type: Boolean }, data: { type: String } },
            },
        },
        equipmentTrainingField: [{ type: String }],
    },
    beResourcesNewHireTechChecklist: {
        checklist: {
            emailNeeded: { type: Boolean },
            computerNeeded: { state: { type: Boolean }, numeric_keypad_on_laptop: { type: Boolean } },
            hotspot_needed: { type: Boolean },
            amex_needed: { type: Boolean },
            fuel_card_needed: { state: { type: Boolean }, company_vehicle: { type: Boolean }, personal: { type: Boolean } },
            sharePointNeeded: { type: Boolean },
            dataPointNeeded: { type: Boolean },
            businessCard_needed_boolean: { type: Boolean },
            sageUser_remoteDesktop_needed: { type: Boolean },
            office_phone_needed: { type: Boolean },
            printer_needed: { type: Boolean },
            networkPrinter_needed: { type: Boolean },
            external_monitor_needed: { type: Boolean },
            additional_techologySoftware_needed: { state: { type: Boolean }, data: { type: String } },
            additional_office_needed: { state: { type: mongoose_1.Schema.Types.Mixed }, data: { type: String } },
        },
        sharePointGroups: { type: Map, of: mongoose_1.Schema.Types.Mixed },
        business_card_data: {
            side1: {
                name: { type: String },
                title: { type: String },
                cell: { type: String },
                email: { type: String },
                add_phone: { type: String },
                fax: { type: String },
            },
            side2: { location: { type: String } },
        },
    },
});
exports.ApplicantModel = mongoose_1.default.model('applicants', ApplicantSchema);
