
type QuestionChoiceBasic = {
    type: 'choice',
    name: string,
    meta?: any
}

export type QuestionChoice = QuestionChoiceBasic & {
    next?: QuestionChain
} | {
    type: 'separator'
}
type BaseQuestionChain = {
    name: string,
    message: string,
    validate?: (input: any) => string | boolean | Promise<string | boolean>
    filter?: (input: string) => string | Promise<string>
}
type QuestionChainToString = BaseQuestionChain & {
    type: 'list',
    choices: QuestionChoice[],
} | BaseQuestionChain & {
    type: 'rawlist',
    choices: QuestionChoice[],
} | BaseQuestionChain & {
    type: 'input',
};
type QuestionChainToStringArray = BaseQuestionChain & {
    type: 'checkbox',
    choices: QuestionChoiceBasic[],
};
export type QuestionChain = QuestionChainToString | QuestionChainToStringArray;

export type Answer = {type: 'single', answer: string, name?: string} | 
{type: 'multi', answer: string[], name?: string} |
{type: 'abort', answer: undefined, name?: string}

export interface IUserInput {
    ask(questionChain: QuestionChain): Promise<Answer>
    close(): void;
}