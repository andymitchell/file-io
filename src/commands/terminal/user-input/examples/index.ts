#!/bin/env node

// Run locally with `npm run test_cli:user_input`

import { UserInputNode } from "../UserInputNode.ts";

async function main() {
    const userInput = new UserInputNode();

    
    const result = await userInput.ask({
        type: 'rawlist',
        name: "name",
        message: "What is your name?",
        choices: [
            {
                type: 'choice',
                name: 'Bob'
            },
            {
                type: 'choice',
                name: 'Alice'
            }
        ]
    })

    const result2 = await userInput.ask({
        type: 'list',
        name: "goal",
        message: "What is goal",
        choices: [
            {
                type: 'choice',
                name: 'Learn',
                next: {
                    type: 'list',
                    name: 'action',
                    message: "Choose an action",
                    choices: [
                        {
                            type: 'choice',
                            name: 'Archive'
                        },
                        {
                            type: 'choice',
                            name: 'Books'
                        }
                    ]
                }
            },
            {
                type: 'choice',
                name: 'Do'
            }
        ]
    })
    

    const result3 = await userInput.ask({
        type: 'checkbox',
        name: "include",
        message: "What will you take?",
        choices: [
            {
                type: 'choice',
                name: 'Pen'
            },
            {
                type: 'choice',
                name: 'Paper'
            }
        ]
    })

    const result4 = await userInput.ask({
        type: 'confirm',
        name: "confirmerer",
        message: "Shall we make it?",
        default: false
    })

    
    console.log(result);
    console.log(result2);
    console.log(result3);
    console.log(result4);
}


main().catch((err) => {
    console.error(err);
    process.exit(1);
});