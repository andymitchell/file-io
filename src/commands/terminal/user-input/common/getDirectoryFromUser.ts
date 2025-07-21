

import { existsSync } from "fs";
import type { IUserInput, QuestionChoice } from "../types.ts";

export async function getDirectoryFromUser(userInput:IUserInput,  currentDirectory:string, name: string, message:string, suggestedDirs:string[]):Promise<string | undefined> {
    const chosenDir = await userInput.ask({
        type: suggestedDirs.length? 'list' : 'input',
        name,
        message,
        choices: [
            ...suggestedDirs.map(name => ({type: 'choice', name} as QuestionChoice)),
            {
                type: 'choice', 
                name: "Other",
                next: {
                    type: 'input',
                    name: 'other',
                    message: "Enter a directory:",
                    validate: async (input) => {
                        const possiblePath = `${currentDirectory}/${input}`;
                        if( existsSync(input) || existsSync(possiblePath) ) {
                            return true;
                        } else {
                            return `Please choose a directory that exists`;
                        }
                    },
                    filter: async (input) => {
                        const possiblePath = `${currentDirectory}/${input}`;
                        if( existsSync(input) ) {
                            return input;
                        } else if( existsSync(possiblePath) ) {
                            return possiblePath;
                        } else {
                            throw new Error("Not a known dir");
                        }
                    }
                }
            }
        ]
    });

    if( chosenDir.type==='single' ) {
        return chosenDir.answer;
    }
    return undefined;
}