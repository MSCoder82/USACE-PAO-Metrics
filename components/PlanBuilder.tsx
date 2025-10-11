

import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { SparklesIcon } from './Icons';

const STEP_PROMPTS = {
  1: { title: "Step 1: Define the Issue", prompt: "Let's start with the basics. What is the core issue or project you need a communication plan for? Why is communication necessary right now?" },
  2: { title: "Step 2: Analyze the Situation", prompt: "Now, let's analyze the current situation. Briefly describe the background, any research you have, and a simple SWOT analysis (Strengths, Weaknesses, Opportunities, Threats). What mindset do you want to change?" },
  3: { title: "Step 3: Identify Audiences", prompt: "Who are your stakeholders and target audiences? List them out and consider their level of interest and influence." },
  4: { title: "Step 4: Define Goals & Objectives", prompt: "What are your communication goals? For each goal, define specific, measurable objectives. For example, 'Increase public awareness by 20% by December 31st.'" },
  5: { title: "Step 5: Develop Strategies & Messages", prompt: "How will you achieve your goals? Outline your main strategies, key tactics, and the core messages you want to convey. Include a few talking points for each message." },
  6: { title: "Step 6: Determine the Budget", prompt: "What resources are required? List potential budget items like advertising, materials, or event costs. A rough estimate is fine for now." },
  7: { title: "Step 7: Create an Action Matrix", prompt: "Let's make this actionable. Create a simple table or list of actions, who is responsible for each (owner), and a due date." },
  8: { title: "Step 8: Plan for Implementation", prompt: "How will you track implementation? Think about potential risks and how you might mitigate them." },
  9: { title: "Step 9: Establish Measurement", prompt: "How will you measure success? List the Key Performance Indicators (KPIs) you'll be tracking and how you'll collect that data." },
  10: { title: "Step 10: Plan for Post-Analysis", prompt: "Finally, how will you evaluate the plan's effectiveness after the campaign? What lessons do you hope to learn for the next cycle?" },
};

const RenderMarkdown: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n').map(line => line.trim());
  return (
    <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none dark:prose-invert prose-h2:text-navy-900 prose-h3:text-navy-800 prose-p:text-navy-800 dark:prose-h2:text-white dark:prose-h3:text-navy-100 dark:prose-p:text-navy-200">
      {lines.map((line, index) => {
        if (line.startsWith('## ')) return <h2 key={index} className="text-2xl font-bold mt-6 mb-3 border-b pb-2 border-navy-200 dark:border-navy-700">{line.substring(3)}</h2>;
        if (line.startsWith('### ')) return <h3 key={index} className="text-xl font-semibold mt-4 mb-2">{line.substring(4)}</h3>;
        if (line.startsWith('* ')) return <li key={index} className="ml-6">{line.substring(2)}</li>;
        if (line.trim() === '') return null;

        const parts = line.split(/(\*\*.*?\*\*)/g).filter(part => part);
        return (
          <p key={index} className="my-2">
            {parts.map((part, i) =>
              part.startsWith('**') && part.endsWith('**') ? 
                <strong key={i}>{part.slice(2, -2)}</strong> : 
                part
            )}
          </p>
        );
      })}
    </div>
  );
};


const PlanBuilder: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0); // 0: intro, 1-10: steps, 11: generating, 12: complete
    const [planData, setPlanData] = useState<Record<number, string>>({});
    const [currentInput, setCurrentInput] = useState('');
    const [generatedPlan, setGeneratedPlan] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setCurrentInput(planData[currentStep] || '');
    }, [currentStep, planData]);

    const handleStart = () => setCurrentStep(1);

    const handleNext = () => {
        if (currentStep < 10) {
            setPlanData(prev => ({ ...prev, [currentStep]: currentInput }));
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setPlanData(prev => ({ ...prev, [currentStep]: currentInput }));
            setCurrentStep(prev => prev - 1);
        }
    };
    
    const handleGeneratePlan = async () => {
        setIsLoading(true);
        const finalPlanData = { ...planData, [10]: currentInput };
        setPlanData(finalPlanData);

        const systemInstruction = `You are an expert communication strategist for the U.S. Army Corps of Engineers (USACE). Your task is to synthesize user-provided notes into a formal, comprehensive 10-step communication plan. The output should be a single, well-structured document using Markdown for formatting (headings, bold text, bullet points). Do not output JSON or any other code format. Adopt a professional and authoritative tone. Use '##' for main step headings (e.g., '## Step 1: Define the Issue') and '###' for subheadings. Use '*' for bullet points.`;
        
        let fullPrompt = "Please generate a complete communication plan based on the following inputs:\n\n";
        for (let i = 1; i <= 10; i++) {
            fullPrompt += `**${STEP_PROMPTS[i].title}:**\n${finalPlanData[i] || 'No input provided.'}\n\n`;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: fullPrompt,
              config: {
                systemInstruction: systemInstruction,
              },
            });

            setGeneratedPlan(response.text);
            setCurrentStep(12);
        } catch(error) {
            console.error("Error generating plan:", error);
            setGeneratedPlan("Sorry, an error occurred while generating the plan. Please check your connection and API key, then try again.");
            setCurrentStep(12);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleStartOver = () => {
        setCurrentStep(0);
        setPlanData({});
        setCurrentInput('');
        setGeneratedPlan('');
    };

    const ProgressIndicator = () => (
        <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between text-sm font-semibold text-usace-blue dark:text-navy-200">
                <span>Step {currentStep} of 10</span>
                <span>{currentStep * 10}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/40 dark:bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-usace-red via-usace-blue to-navy-600 transition-all" style={{ width: `${currentStep * 10}%` }}></div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow-card dark:shadow-card-dark h-full flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-navy-900 dark:text-white mb-4">Generating Your Plan...</h2>
                <p className="text-gray-600 dark:text-navy-300 mb-6">The AI is synthesizing your inputs into a professional document.</p>
                <div className="glass-panel h-full flex flex-col items-center justify-center space-y-4 text-center">
                    <h2 className="text-2xl font-semibold text-navy-900 dark:text-white">Generating your plan...</h2>
                    <p className="text-sm text-navy-600 dark:text-navy-200">The AI is synthesizing your inputs into a professional document.</p>
                    <div className="flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full bg-gradient-to-r from-usace-red to-usace-blue animate-pulse [animation-delay:-0.3s]"></div>
                        <div className="h-3 w-3 rounded-full bg-gradient-to-r from-usace-red to-usace-blue animate-pulse [animation-delay:-0.15s]"></div>
                        <div className="h-3 w-3 rounded-full bg-gradient-to-r from-usace-red to-usace-blue animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (currentStep === 12) {
        return (
            <div className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow-card dark:shadow-card-dark h-full flex flex-col">
                <h2 className="text-3xl font-bold text-navy-900 dark:text-white mb-4">Your Communication Plan</h2>
                <div className="flex-1 overflow-y-auto mb-4 p-4 bg-navy-50 dark:bg-navy-900 rounded-md border border-navy-200 dark:border-navy-700">
                    <div className="glass-panel h-full flex flex-col space-y-6">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-usace-blue/70 dark:text-navy-200/80">Output</span>
                            <h2 className="mt-2 text-3xl font-semibold text-navy-900 dark:text-white">Your communication plan</h2>
                        </div>
                        <div className="subtle-scrollbar flex-1 overflow-y-auto rounded-2xl border border-white/30 bg-white/50 p-4 dark:border-white/10 dark:bg-white/5">
                            <RenderMarkdown content={generatedPlan} />
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button onClick={handleStartOver} className="surface-button secondary">Start over</button>
                            <button onClick={() => navigator.clipboard.writeText(generatedPlan)} className="surface-button">Copy to clipboard</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (currentStep >= 1) {
        return (
            <div className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow-card dark:shadow-card-dark h-full flex flex-col">
                <div className="glass-panel h-full flex flex-col space-y-6">
                    <ProgressIndicator />
                    <div className="flex-1 space-y-4">
                        <div>
                            <h3 className="text-2xl font-semibold text-navy-900 dark:text-white">{STEP_PROMPTS[currentStep].title}</h3>
                            <p className="mt-2 text-sm text-navy-600 dark:text-navy-200">{STEP_PROMPTS[currentStep].prompt}</p>
                        </div>
                        <textarea
                            value={currentInput}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            className="textarea-modern h-48 min-h-[10rem] flex-1"
                            placeholder="Capture your notes here..."
                        />
                    </div>
                    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
                        <button onClick={handlePrevious} disabled={currentStep <= 1} className="surface-button secondary disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
                        {currentStep < 10 ? (
                            <button onClick={handleNext} className="surface-button">Next step</button>
                        ) : (
                            <button onClick={handleGeneratePlan} className="surface-button">
                                <SparklesIcon className="h-5 w-5" />
                                <span>Generate plan</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-navy-800 p-8 rounded-lg shadow-card dark:shadow-card-dark h-full flex flex-col items-center justify-center text-center">
            <SparklesIcon className="w-16 h-16 text-usace-blue mb-4" />
            <h2 className="text-3xl font-bold text-navy-900 dark:text-white mb-4">AI Communication Plan Builder</h2>
            <p className="max-w-xl text-gray-600 dark:text-navy-300 mb-8">
                Let's create a comprehensive, 10-step USACE communication plan. I'll guide you through each step. Just provide your notes and insights, and the AI will assemble a professional plan for you.
            </p>
            <button onClick={handleStart} className="inline-flex justify-center rounded-md border border-transparent bg-usace-blue py-3 px-6 text-base font-medium text-white shadow-sm hover:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-usace-blue focus:ring-offset-2 dark:focus:ring-offset-navy-800 transition-colors">
                Let's Get Started
            </button>
            <div className="glass-panel h-full flex flex-col items-center justify-center space-y-6 text-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-usace-red/20 to-usace-blue/20 text-usace-blue">
                    <SparklesIcon className="h-10 w-10" />
                </span>
                <div className="space-y-4">
                    <h2 className="text-3xl font-semibold text-navy-900 dark:text-white">AI Communication Plan Builder</h2>
                    <p className="max-w-xl text-sm text-navy-600 dark:text-navy-200">
                        Build a comprehensive 10-step USACE communication plan with guided prompts. Capture your insights and let the assistant assemble a polished narrative.
                    </p>
                </div>
                <button onClick={handleStart} className="surface-button text-base px-8 py-3">Let's get started</button>
            </div>
        </div>
    );
};

export default PlanBuilder;