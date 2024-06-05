
import inquirer from 'inquirer';
import { IUserInput, QuestionChain } from './types';
import { BaseUserInput } from './BaseUserInput';




export class UserInputNode extends BaseUserInput implements IUserInput {

    constructor() {       
        super(); 
    }

    private async _prompt<T>(question:QuestionChain):Promise<T> {        
        const response = await inquirer.prompt(question);
        return response[question.name];
    }

    protected async prompt(question:QuestionChain):Promise<string | undefined> {
        return await this._prompt<string | undefined>(question);
    }

    protected async promptMulti(question:QuestionChain):Promise<string[]> {
        return await this._prompt<string[]>(question);
    }

    protected async promptBoolean(question:QuestionChain):Promise<boolean> {
        return !!(await this._prompt<boolean | undefined>(question));
    }

}
