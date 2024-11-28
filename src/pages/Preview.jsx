import React, { useState } from 'react';
import Microlink from "@microlink/react";

const Preview = ({link}) => {
  const [showFullPreview, setShowFullPreview] = useState(false);

  if (!link) return null;

  return (
    <div className='w-full rounded-xl shadow-lg bg-white border border-gray-100'>
      <div className='p-6'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-xl font-semibold text-gray-800'>Website Preview</h3>
          <span className='px-3 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full'>
            Live Preview
          </span>
        </div>

        <div className='space-y-6'>
          <div className='p-4 bg-gray-50 rounded-lg border border-gray-200'>
            <p className='text-sm font-medium text-gray-600 break-all'>{link}</p>
          </div>
          
          <div className='space-y-4'>
            <div className='transform hover:scale-[1.02] transition-transform'>
              <Microlink 
                url={link}
                size='large'
                media={['image', 'logo']}
                style={{ borderRadius: '12px' }}
              />
            </div>

            <div className='flex justify-center pt-2'>
              <button
                onClick={() => setShowFullPreview(!showFullPreview)}
                className='inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
              >
                {showFullPreview ? 'Hide Full Preview' : 'Show Full Preview'}
              </button>
            </div>

            {showFullPreview && (
              <div className='mt-6 rounded-xl border border-gray-200 overflow-hidden shadow-inner bg-white'>
                <iframe
                  src={link}
                  title="Website Preview"
                  className='w-full h-[600px] bg-white'
                  sandbox="allow-same-origin allow-scripts"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;