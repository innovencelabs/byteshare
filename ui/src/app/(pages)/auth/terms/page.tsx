import React from 'react'
import termsData from 'public/Data/terms-page-data.json';


function Terms () {
  const { welcomeMessage,paragraphMessage,note, sections } = termsData.termsOfUse;

  return (
    <div className="p-5">
      <header className="container max-width-lg mt-4 mb-4">
        <div className="flex flex-col place-items-center justify-center line-height-xl v-space-md margin-bottom-md text-3xl leading-8">
            <h1 className='text-4xl font-bold text-center '>{welcomeMessage}</h1>
          <p className='w-3/2 pt-5 text-lg text-center text-lightgray'>{paragraphMessage}
          <span className='w-3/2 pt-2 text-lg font-bold text-lighgray-foreground text-center'>{note}</span>
          </p>
          
        </div>
    </header>   
      {sections.map((section, index) => (
        <div className='pt-10' key={index}>
          <h2 className='text-2xl font-bold pb-2' >{section.title}</h2>
          <ul>
            {section.content.map((item, idx) => (
              <li className='text-xl text-lightgray'key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Terms;
