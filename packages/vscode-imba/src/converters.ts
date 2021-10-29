import * as vscode from 'vscode';
import * as PConst from './protocol.const'

export function convertKind(kind: string): vscode.CompletionItemKind {
    switch (kind) {
        case 'event':
            return vscode.CompletionItemKind.Event;
        case PConst.Kind.primitiveType:
        case PConst.Kind.keyword:
            return vscode.CompletionItemKind.Keyword;

        case PConst.Kind.const:
        case PConst.Kind.let:
        case PConst.Kind.variable:
        case PConst.Kind.localVariable:
        case PConst.Kind.alias:
        case PConst.Kind.parameter:
            return vscode.CompletionItemKind.Variable;

        case PConst.Kind.memberVariable:
        case PConst.Kind.memberGetAccessor:
        case PConst.Kind.memberSetAccessor:
            return vscode.CompletionItemKind.Field;

        case PConst.Kind.function:
        case PConst.Kind.localFunction:
            return vscode.CompletionItemKind.Function;

        case PConst.Kind.method:
        case PConst.Kind.constructSignature:
        case PConst.Kind.callSignature:
        case PConst.Kind.indexSignature:
            return vscode.CompletionItemKind.Method;

        case PConst.Kind.enum:
            return vscode.CompletionItemKind.Enum;

        case PConst.Kind.enumMember:
            return vscode.CompletionItemKind.EnumMember;

        case PConst.Kind.module:
        case PConst.Kind.externalModuleName:
            return vscode.CompletionItemKind.Module;

        case PConst.Kind.class:
        case PConst.Kind.type:
            return vscode.CompletionItemKind.Class;

        case PConst.Kind.interface:
            return vscode.CompletionItemKind.Interface;

        case PConst.Kind.warning:
            return vscode.CompletionItemKind.Text;

        case PConst.Kind.script:
            return vscode.CompletionItemKind.File;

        case PConst.Kind.directory:
            return vscode.CompletionItemKind.Folder;

        case PConst.Kind.string:
            return vscode.CompletionItemKind.Constant;

        default:
            return vscode.CompletionItemKind.Property;
    }
}