
import type { IFileIo } from "../../types.js";
import type { IUserInput, QuestionChoice } from "../types.ts";

export async function getDirectoryFromUser(userInput:IUserInput, fileSystem:IFileIo, currentDirectory:string, name: string, message:string, suggestedDirs:string[]):Promise<string | undefined> {
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
                        if( (await fileSystem.has_directory(input)) || (await fileSystem.has_directory(possiblePath)) ) {
                            return true;
                        } else {
                            return `Please choose a directory that exists`;
                        }
                    },
                    filter: async (input) => {
                        const possiblePath = `${currentDirectory}/${input}`;
                        if( (await fileSystem.has_directory(input)) ) {
                            return input;
                        } else if( await fileSystem.has_directory(possiblePath) ) {
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