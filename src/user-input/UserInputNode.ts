
import inquirer from 'inquirer';
import type { IUserInput, QuestionChain } from './types.js';
import { BaseUserInput } from './BaseUserInput.js';




export class UserInputNode extends BaseUserInput implements IUserInput {

    constructor() {       
        super(); 
    }

    private async _prompt<T>(question:QuestionChain):Promise<T> {        
        const response = await inquirer.prompt(question);
        return response[question.name];
    }

    protected override async prompt(question:QuestionChain):Promise<string | undefined> {
        return await this._prompt<string | undefined>(question);
    }

    protected override async promptMulti(question:QuestionChain):Promise<string[]> {
        return await this._prompt<string[]>(question);
    }

    protected override async promptBoolean(question:QuestionChain):Promise<boolean> {
        return !!(await this._prompt<boolean | undefined>(question));
    }

}
