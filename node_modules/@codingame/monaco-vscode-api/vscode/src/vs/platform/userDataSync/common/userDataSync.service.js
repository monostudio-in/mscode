
import { createDecorator } from '../../instantiation/common/instantiation.js';

const IUserDataSyncStoreManagementService = ( createDecorator("IUserDataSyncStoreManagementService"));
const IUserDataSyncStoreService = ( createDecorator("IUserDataSyncStoreService"));
const IUserDataSyncLocalStoreService = ( createDecorator("IUserDataSyncLocalStoreService"));
const IUserDataSyncEnablementService = ( createDecorator("IUserDataSyncEnablementService"));
const IUserDataSyncService = ( createDecorator("IUserDataSyncService"));
const IUserDataSyncResourceProviderService = ( createDecorator("IUserDataSyncResourceProviderService"));
const IUserDataAutoSyncService = ( createDecorator("IUserDataAutoSyncService"));
const IUserDataSyncUtilService = ( createDecorator("IUserDataSyncUtilService"));
const IUserDataSyncLogService = ( createDecorator("IUserDataSyncLogService"));

export { IUserDataAutoSyncService, IUserDataSyncEnablementService, IUserDataSyncLocalStoreService, IUserDataSyncLogService, IUserDataSyncResourceProviderService, IUserDataSyncService, IUserDataSyncStoreManagementService, IUserDataSyncStoreService, IUserDataSyncUtilService };
