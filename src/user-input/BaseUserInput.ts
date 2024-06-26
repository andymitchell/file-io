import { Answer, IUserInput, QuestionChain,  QuestionChoice } from './types';

export class BaseUserInput implements IUserInput {

    constructor() {        
    }

    protected async prompt(question:QuestionChain):Promise<string | undefined> {
        throw new Error("Method not implemented");
    }

    protected async promptMulti(question:QuestionChain):Promise<string[]> {
        throw new Error("Method not implemented");
    }

    protected async promptBoolean(question:QuestionChain):Promise<boolean> {
        throw new Error("Method not implemented");
    }

    async ask(question: QuestionChain): Promise<Answer> {

        if( question.type==='list' || question.type==='rawlist' ) {
            let choice:QuestionChoice | undefined;
            const chosen = await this.prompt(question);
            if( !chosen ) {
                // User entered nothing - abort
                return {type:'abort', answer: undefined};
            }
            choice = question.choices.find(x => x.type==='choice' && x.name===chosen);
            if( !choice || choice.type!=='choice' ) throw new Error("noop - typeguard");

            if( choice.next ) {
                return this.ask(choice.next);
            } else {
                return {type: 'single', answer: choice.name, name: question.name, meta: choice.meta};
            }
        } else if( question.type==='input') {
            const result = await this.prompt(question);
            return result===undefined? {type: 'abort', answer: undefined} : {type: 'single', answer: result, name: question.name};
            
        } else if( question.type==='confirm') {
            const result = await this.promptBoolean(question);
            return result===undefined? {type: 'abort', answer: undefined} : {type: 'confirmation', answer: result, name: question.name};
            
        } else if ( question.type==='checkbox') {
            const answer = await this.promptMulti(question);
            const meta:any[] = [];
            for( let i = 0; i < answer.length; i++ ) {
                meta[i] = question.choices.find(x => x.name===answer[i])?.meta
            }
            return {type: 'multi', answer, name: question.name, meta};
        }
        return {type: 'abort', answer: undefined};
    
    }

    close() {
        
    }
}