import React from 'react';
import ReactDOM from 'react-dom';

const portalRoot = document.body; // 将portal渲染到body下

const Portal = ({ children }) => {
  return ReactDOM.createPortal(children, portalRoot);
};

export default Portal;