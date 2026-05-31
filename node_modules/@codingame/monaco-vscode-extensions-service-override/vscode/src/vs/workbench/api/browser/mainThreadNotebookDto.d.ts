import * as extHostProtocol from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import * as notebookCommon from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/notebook/common/notebookCommon";
import { ICellExecuteUpdate, ICellExecutionComplete } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/notebook/common/notebookExecutionStateService";
export declare namespace NotebookDto {
    function toNotebookOutputItemDto(item: notebookCommon.IOutputItemDto): extHostProtocol.NotebookOutputItemDto;
    function toNotebookOutputDto(output: notebookCommon.IOutputDto): extHostProtocol.NotebookOutputDto;
    function toNotebookCellDataDto(cell: notebookCommon.ICellDto2): extHostProtocol.NotebookCellDataDto;
    function toNotebookDataDto(data: notebookCommon.NotebookData): extHostProtocol.NotebookDataDto;
    function fromNotebookOutputItemDto(item: extHostProtocol.NotebookOutputItemDto): notebookCommon.IOutputItemDto;
    function fromNotebookOutputDto(output: extHostProtocol.NotebookOutputDto): notebookCommon.IOutputDto;
    function fromNotebookCellDataDto(cell: extHostProtocol.NotebookCellDataDto): notebookCommon.ICellDto2;
    function fromNotebookDataDto(data: extHostProtocol.NotebookDataDto): notebookCommon.NotebookData;
    function toNotebookCellDto(cell: notebookCommon.ICell): extHostProtocol.NotebookCellDto;
    function fromCellExecuteUpdateDto(data: extHostProtocol.ICellExecuteUpdateDto): ICellExecuteUpdate;
    function fromCellExecuteCompleteDto(data: extHostProtocol.ICellExecutionCompleteDto): ICellExecutionComplete;
    function fromCellEditOperationDto(edit: extHostProtocol.ICellEditOperationDto): notebookCommon.ICellEditOperation;
}
