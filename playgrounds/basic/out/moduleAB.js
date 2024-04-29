"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runModules = void 0;
var test = import.meta;
var modules = test.glob('./*.ts', { eager: true });
// const modules = import.meta.glob('./*.ts', { eager: true });
// Function to execute module functions
var runModules = function () {
    Object.entries(modules).forEach(function (_a) {
        var moduleName = _a[0], module = _a[1];
        if (moduleName.includes('moduleA')) {
            module.runA();
        }
        else if (moduleName.includes('moduleB')) {
            module.runB();
        }
    });
};
exports.runModules = runModules;
