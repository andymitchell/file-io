
import inquirer from 'inquirer';
import { IUserInput, QuestionChain } from './types';
import { BaseUserInput } from './BaseUserInput';




export class UserInputNode extends BaseUserInput implements IUserInput {

    constructor() {       
        super(); 
    }

    protected async prompt(question:QuestionChain):Promise<string | undefined> {
        //const choicesText = questionChain.choices.map((choice, index) => `${index}. ${choice.choice}`).join("\n");
        
        const response = await inquirer.prompt(question);
        return response[question.name];
    }

    protected async promptMulti(question:QuestionChain):Promise<string[]> {
        
        const response = await inquirer.prompt(question);
        return response[question.name];
    }

}
