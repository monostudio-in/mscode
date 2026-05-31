

function sendInlineCompletionsEndOfLifeTelemetry(dataChannel, endOfLifeSummary) {
    dataChannel.publicLog2('inlineCompletion.endOfLife', endOfLifeSummary);
}

export { sendInlineCompletionsEndOfLifeTelemetry };
