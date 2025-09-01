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
exports.EmployeeRequisitionFormModel = void 0;
const crypto_1 = require("crypto");
const mongoose_1 = __importStar(require("mongoose"));
const EmployeeRequisitionFormSchema = new mongoose_1.Schema({
    formId: { type: String, default: crypto_1.randomUUID },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, required: true },
    reportTo: { type: String, required: true },
    jobNumber: { type: String, required: true },
    jobLocation: { type: String, required: true },
    projectedLength: { type: mongoose_1.Schema.Types.Mixed, required: true },
    updatedBy: { type: String, required: false },
    updatedAt: { type: Date, required: false },
    applicants: { type: [String], require: false }
}, { timestamps: true, strict: 'throw' });
exports.EmployeeRequisitionFormModel = mongoose_1.default.model('employeeRequisitionForms', EmployeeRequisitionFormSchema);
