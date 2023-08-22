require('dotenv').config();
const { OpenAI } = require('langchain/llms/openai');
const { PromptTemplate } = require('langchain/prompts');
const { StructuredOutputParser } = require('langchain/output_parsers');
const inquirer = require('inquirer');

const model = new OpenAI({
	openAIApiKey: process.env.OPENAI_API_KEY,
	temperature: 0,
	model: 'gpt-3.5-turbo'
});

const parser = StructuredOutputParser.fromNamesAndDescriptions({
	code: 'Javascript code that answers the users\'s question',
	explanation: 'detailed explanation of the example code provided',
});

// console.log({model});

const promptFunc = async (input) => {
	try {
		const formatInstructions = parser.getFormatInstructions();

		const prompt = new PromptTemplate({
			template: 'You are a javascript expert and will answer the user\'s coding questions thoroughly as possible.\n{format_instructions}\n{question}',
			inputVariables: ['question'],
			partialVariables: { format_instructions: formatInstructions }
		});

		const promptInput = await prompt.format({
			question: input,
		});

		const res = await model.call(promptInput);

		console.log(await parser.parse(res));
	} catch (error) {
		console.error(error);	
	}
};

const init = () => {
	inquirer.prompt([
		{
			type: 'input',
			name: 'name',
			message: 'Ask a coding question:'
		},
	])
		.then(inquirerResponse => {
			promptFunc(inquirerResponse.name);
		})
};

init();