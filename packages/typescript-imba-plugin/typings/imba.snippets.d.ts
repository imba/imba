
declare namespace imba_snippets {

    interface imports {
        /**
         * @importStar imba-codicons
         */
        CODICONS: void;

        /**
         * @importStar imba-material-icons
         */
         MATERIAL: void;

        /**
         * @importStar imba-seti-icons
         */
        SETI: void;
    }

    interface tags {
        /**
         * @snippet input type='checkbox'
         */
        'input-checkbox': void
        /**
         * @snippet input type='radio'
         */
        'input-radio': void

        /**
         * @snippet input type='range'
         */
        'input-range': void

        /**
         * @snippet input type='text'
         */
        'input-text': void

        /**
         * @snippet input type='color'
         */
        'input-color': void

        /**
         * @snippet input type='number'
         */
        'input-number': void

        /**
         * @snippet input type='email'
         */
        'input-email': void
    }

    interface types {
        any: void
        string: void
        number: void
        boolean: void
        void: void
        object: void;
        unknown: void;
    }

    interface root {
        /**
         * @snippet export default class ${1:${TM_FILENAME_BASE/(.*)/${1:/pascalcase}/}}\n\t$0\n\n
         */
        'export-default-class': void

        /**
         * @snippet export class ${1:${TM_FILENAME_BASE/(.*)/${1:/pascalcase}/}}\n\t$0\n\n
         */
        'export-class': void

        /**
         * @snippet export tag ${1:${TM_FILENAME_BASE/(.*)/${1:/pascalcase}/}}\n\n\t<self> $0\n\n
         */
        'export-tag': void

        /**
         * @snippet tag ${1:${TM_FILENAME_BASE/(.*)/${1:/downcase}/}}\n\n\t<self> $0\n\n
         */
        'tag': void
    }

    interface values {
        /**
         * @snippet export default class ${1:${TM_FILENAME_BASE/(.*)/${1:/pascalcase}/}}\n\t$0\n\n
         */
        'export-default-class': void

        /**
         * @snippet export class ${1:${TM_FILENAME_BASE/(.*)/${1:/pascalcase}/}}\n\t$0\n\n
         */
        'export-class': void

        /**
         * @snippet export tag ${1:${TM_FILENAME_BASE/(.*)/${1:/pascalcase}/}}\n\n\t<self> $0\n\n
         */
        'export-tag': void

        /**
         * @snippet tag ${1:${TM_FILENAME_BASE/(.*)/${1:/downcase}/}}\n\n\t<self> $0\n\n
         */
        'tag': void
    }
}