import type { Answer, IUserInput, QuestionChain } from "../types.js";

export type TestQuestionAnswerMap = Record<string, Answer>;

/**
 * A way to test user input without requiring interactivity. 
 * Provide it answers for each question's name property. 
 */
export class TestUserInput implements IUserInput {
    private questionAnswerMap:TestQuestionAnswerMap;

    /**
     * 
     * @param questionAnswerMap Provide a record, keyed on the question's 'name' property, with the value of an Answer.
     * @example
     * // For question {type:'confirm', message: 'Will you?', name: 'q_will_you'}, do: 
     * new TestUserInput({'q_will_you': {type: 'confirmation', answer: true}})
     */
    constructor(questionAnswerMap:TestQuestionAnswerMap) {
        this.questionAnswerMap = questionAnswerMap;
    }

    async ask(questionChain: QuestionChain): Promise<Answer> {
        const answer = this.questionAnswerMap[questionChain.name]
        if( answer ) {
            return answer;
        } else {
            throw new Error(`Undefined TestUserInput question name: ${questionChain.name}`);
        }
    }
    close(): void {
        throw new Error("Method not implemented.");
    }
}

export async function runTestUserInputExample() {
    const testUserInput = new TestUserInput({
        'q_will_you': {type: 'confirmation', answer: true},
    })

    const response = await testUserInput.ask({type: 'confirm', message: 'Will you?', name: 'q_will_you'}); 
    console.log(response); // {type: 'confirmation', answer: true}
}
