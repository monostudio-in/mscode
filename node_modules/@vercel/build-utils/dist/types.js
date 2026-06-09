"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var types_exports = {};
__export(types_exports, {
  BunVersion: () => BunVersion,
  JOB_TRIGGERS: () => JOB_TRIGGERS,
  NodeVersion: () => NodeVersion,
  Version: () => Version,
  getReportedServiceType: () => getReportedServiceType,
  getServiceQueueTopicConfigs: () => getServiceQueueTopicConfigs,
  getServiceQueueTopics: () => getServiceQueueTopics,
  isExperimentalService: () => isExperimentalService,
  isExperimentalServiceV2: () => isExperimentalServiceV2,
  isQueueBackedService: () => isQueueBackedService,
  isQueueTriggeredService: () => isQueueTriggeredService,
  isScheduleTriggeredService: () => isScheduleTriggeredService,
  isWorkflowTriggeredService: () => isWorkflowTriggeredService
});
module.exports = __toCommonJS(types_exports);
class Version {
  constructor(version) {
    this.major = version.major;
    this.minor = version.minor;
    this.range = version.range;
    this.runtime = version.runtime;
    this.discontinueDate = version.discontinueDate;
  }
  get state() {
    if (this.discontinueDate && this.discontinueDate.getTime() <= Date.now()) {
      return "discontinued";
    } else if (this.discontinueDate) {
      return "deprecated";
    }
    return "active";
  }
  get formattedDate() {
    return this.discontinueDate && this.discontinueDate.toISOString().split("T")[0];
  }
}
class NodeVersion extends Version {
}
class BunVersion extends Version {
}
const JOB_TRIGGERS = ["queue", "schedule", "workflow"];
function isExperimentalService(service) {
  return service.schema === "experimentalServices";
}
function isExperimentalServiceV2(service) {
  return service.schema === "experimentalServicesV2";
}
function getServiceQueueTopicConfigs(config) {
  if (Array.isArray(config.topics) && config.topics.length > 0) {
    return typeof config.topics[0] === "string" ? config.topics.map((topic) => ({ topic })) : config.topics;
  }
  return config.type === "worker" ? [{ topic: "default" }] : [];
}
function getServiceQueueTopics(config) {
  return getServiceQueueTopicConfigs(config).map((topic) => topic.topic);
}
function isQueueTriggeredService(service) {
  return service.type === "worker" || service.type === "job" && service.trigger === "queue";
}
function isScheduleTriggeredService(service) {
  return service.type === "cron" || service.type === "job" && service.trigger === "schedule";
}
function isWorkflowTriggeredService(service) {
  return service.type === "job" && service.trigger === "workflow";
}
function isQueueBackedService(service) {
  return isQueueTriggeredService(service) || isWorkflowTriggeredService(service);
}
function getReportedServiceType(service) {
  switch (service.type) {
    case "web":
      return "web";
    case "cron":
      return "schedule";
    case "worker":
      return "queue";
    case "job":
      if (service.trigger === "schedule")
        return "schedule";
      if (service.trigger === "queue")
        return "queue";
      if (service.trigger === "workflow")
        return "workflow";
      return void 0;
    default:
      return void 0;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BunVersion,
  JOB_TRIGGERS,
  NodeVersion,
  Version,
  getReportedServiceType,
  getServiceQueueTopicConfigs,
  getServiceQueueTopics,
  isExperimentalService,
  isExperimentalServiceV2,
  isQueueBackedService,
  isQueueTriggeredService,
  isScheduleTriggeredService,
  isWorkflowTriggeredService
});
