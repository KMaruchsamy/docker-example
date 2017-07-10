// Typings reference file, you can add your own global typings here
// https://www.typescriptlang.org/docs/handbook/writing-declaration-files.html

declare var System: any;
declare var moment: any;
declare var _: any;
declare var CryptoJS :any;

interface TimeickerOptions {
    defaultTime?: string;
    disableFocus?: boolean;
    isOpen?: boolean;
    minuteStep?: number;
    modalBackdrop?: boolean;
    secondStep?: number;
    showSeconds?: boolean;
    showInputs?: boolean;
    showMeridian?: boolean;
    template?: string;
    appendWidgetTo?: string;
}



interface BootstrapSelectOptions {
    actionsBox?: boolean
    container?: string | boolean
    countSelectedText?: string | Function
    deselectAllText?: string
    dropdownAlignRight?: string | boolean
    dropupAuto?: boolean
    header?: string
    hideDisabled?: boolean
    iconBase?: string
    liveSearch?: boolean
    liveSearchNormalize?: boolean
    liveSearchPlaceholder?: string
    liveSearchStyle?: string
    maxOptions?: number | boolean
    maxOptionsText?: string | Array<any> | Function
    mobile?: boolean
    multipleSeparator?: string
    noneSelectedText?: string
    selectAllText?: string
    selectedTextFormat?: string
    selectOnTab?: boolean
    showContent?: boolean
    showIcon?: boolean
    showSubtext?: boolean
    showTick?: boolean
    size?: string | number | boolean
    style?: string
    tickIcon?: string
    title?: string
    width?: string | boolean
}

interface JQuery {
    timepicker(): JQuery;
    timepicker(methodName: string): JQuery;
    timepicker(methodName: string, params: any): JQuery;
    timepicker(options: TimeickerOptions): JQuery;
    selectpicker(opts?: BootstrapSelectOptions): void
    selectpicker(method: string, ...args: Array<string | Array<string>>): void
}

// Need to be replaced with the typings of responsive datatable ProfileComponent.
interface JQuery {
    DataTable(param?: any): any;
    data(str: any): any;
    table(): any;
    editableform: any;
}


