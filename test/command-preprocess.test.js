const CommandPreprocess = require('../src/command-preprocess');

// Mocking the dependencies
const compilePo = jest.fn();
const parsePo = jest.fn();
const checkPathType = jest.fn();
const isPoFile = jest.fn();
const getFilePathsInDirectory = jest.fn();
const console = {
    log: jest.fn(),
    error: jest.fn()
}


const commandPreprocess = CommandPreprocess({ compilePo, parsePo, checkPathType, isPoFile, getFilePathsInDirectory, console });

describe('commandPreprocess', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });


    it('fails when parsing wrong po file', async () => {

        const err = new Error('Error parsing PO')

        parsePo.mockRejectedValue(err);
        const po = 'path/to/file.po';

        await expect(commandPreprocess({ po }))
        expect(console.error).toHaveBeenCalledWith('· An error occurred preprocessing:', expect.objectContaining({ message: 'Error parsing PO' }));
        expect(compilePo).not.toHaveBeenCalled();

    });


    it('returns when no po files', async () => {

        parsePo.mockResolvedValueOnce('');
        checkPathType.mockResolvedValueOnce('directory');
        getFilePathsInDirectory.mockResolvedValueOnce(['this_is_not_a_po_file.html'])
        const po = 'path/to/dir';


        await commandPreprocess({ po })
        expect(console.log).toHaveBeenNthCalledWith(1, 'Preprocessing PO file: path/to/dir');
        expect(console.log).toHaveBeenNthCalledWith(2, '· Preprocessed 0 files');
        expect(compilePo).not.toHaveBeenCalled();

    });


    it('should process po files correctly', async () => {

        parsePo.mockResolvedValueOnce({ translations: { /* mock translations */ } });
        checkPathType.mockResolvedValueOnce('file');
        getFilePathsInDirectory.mockResolvedValueOnce(['path/to/dir/file.po']);
        isPoFile.mockReturnValueOnce(true);
        compilePo.mockResolvedValueOnce('');

        const po = 'path/to/dir/file.po';
        const prev = 'path/to/dir/otherfile.po';


        // Execute
        await commandPreprocess({ po, prev })

        // Assert

        expect(parsePo).toHaveBeenCalledTimes(2);
        expect(compilePo).toHaveBeenCalled();

        expect(console.log).toHaveBeenNthCalledWith(1, 'Preprocessing PO file: path/to/dir/file.po');
        expect(console.log).toHaveBeenNthCalledWith(2, '· Get translations from: path/to/dir/otherfile.po');
        expect(console.log).toHaveBeenNthCalledWith(3, '· Preprocessed 1 files, translated 0 messages.');
    });

});

