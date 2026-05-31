

class NullWebContentExtractorService {
    extract(_uri) {
        throw ( new Error("Not implemented"));
    }
}
class NullSharedWebContentExtractorService {
    readImage(_uri, _token) {
        throw ( new Error("Not implemented"));
    }
}

export { NullSharedWebContentExtractorService, NullWebContentExtractorService };
