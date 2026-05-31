
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

const IIssueFormService = ( createDecorator("issueFormService"));
const IWorkbenchIssueService = ( createDecorator("workbenchIssueService"));

export { IIssueFormService, IWorkbenchIssueService };
