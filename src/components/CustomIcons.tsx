import React from 'react';

export const WhatsAppIcon: React.FC<{ className?: string, size?: number }> = ({ className, size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M17.472 14.382C17.112 14.202 15.344 13.332 15.013 13.216C14.682 13.1 14.441 13.1 14.201 13.46C13.961 13.82 13.27 14.63 13.06 14.87C12.85 15.11 12.64 15.14 12.28 14.96C11.92 14.78 10.759 14.4 9.383 13.175C8.297 12.208 7.564 11.013 7.354 10.653C7.144 10.293 7.332 10.098 7.512 9.919C7.672 9.759 7.868 9.503 8.048 9.293C8.228 9.083 8.288 8.933 8.408 8.693C8.528 8.453 8.468 8.243 8.378 8.063C8.288 7.883 7.568 6.113 7.268 5.393C6.976 4.695 6.68 4.791 6.47 4.791C6.28 4.791 6.06 4.791 5.84 4.791C5.62 4.791 5.26 4.871 4.96 5.191C4.66 5.511 3.81 6.311 3.81 7.931C3.81 9.551 5.04 11.111 5.22 11.351C5.4 11.591 7.77 15.231 11.4 16.791C12.264 17.162 12.938 17.383 13.468 17.551C14.453 17.863 15.352 17.818 16.064 17.712C16.857 17.594 18.508 16.714 18.848 15.754C19.188 14.794 19.188 13.974 19.098 13.824C19.008 13.674 18.768 13.594 18.408 13.414H17.472V14.382Z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M12 21.6C10.264 21.6 8.632 21.149 7.184 20.359L7.085 20.3L3.52 21.235L4.471 17.761L4.407 17.646C3.535 16.096 3.076 14.338 3.076 12.528C3.076 7.608 7.079 3.605 12 3.605C14.385 3.605 16.626 4.534 18.311 6.22C19.997 7.906 20.925 10.147 20.925 12.532C20.925 17.452 16.921 21.6 12 21.6ZM12 0C5.373 0 0 5.373 0 12C0 14.28 0.648 16.397 1.767 18.21L0.267 23.69L5.897 22.213C7.654 23.167 9.643 23.708 11.748 23.708H12C18.627 23.708 24 18.335 24 11.708C24 5.081 18.627 0 12 0Z" />
  </svg>
);

export const TranslationIcon: React.FC<{ className?: string, size?: number }> = ({ className, size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
     {/* Arrows */}
     <path d="M4 12V7a5 5 0 0 1 5 -5h6a5 5 0 0 1 5 5v5" strokeOpacity="0.8" />
     <path d="M20 7l-3 -3m3 3l3 -3" strokeOpacity="0.8" />
     
     <path d="M20 12v5a5 5 0 0 1 -5 5h-6a5 5 0 0 1 -5 -5v-5" strokeOpacity="0.8" />
     <path d="M4 17l3 3m-3 -3l-3 3" strokeOpacity="0.8" />
     
     {/* A */}
     <path d="M10 6l-3 8h6l-3 -8z" fill="none" transform="translate(4 0) scale(0.6)" strokeWidth="2.5"/>
     <path d="M8 12h4" transform="translate(4 0) scale(0.6)" strokeWidth="2.5"/>
     
     {/* 文 (simplified) */}
     <path d="M12 10h8" transform="translate(-2 6) scale(0.6)" strokeWidth="2.5"/>
     <path d="M16 8v4" transform="translate(-2 6) scale(0.6)" strokeWidth="2.5"/>
     <path d="M16 12l-4 6" transform="translate(-2 6) scale(0.6)" strokeWidth="2.5"/>
     <path d="M16 12l4 6" transform="translate(-2 6) scale(0.6)" strokeWidth="2.5"/>
  </svg>
);