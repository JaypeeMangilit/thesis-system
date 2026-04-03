import styled from "styled-components";

//layout wrapper
export const Layout = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #f5f7fb;
`;

//sidebar
export const Sidebar = styled.div`
  width: 255px;
  background: #9333EA;
  display: flex;
  flex-direction: column;
  padding: 20px;
  color: white;
  transition: all 0.3s ease;

  h1 {
    margin-bottom: 30px;
    font-size: 18px;
    font-weight: bold;
  }

  a {
    padding: 12px 16px;
    margin: 6px 0;
    border-radius: 8px;
    text-decoration: none;
    color: white;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.2s ease;

    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
      transform: translateX(5px);
    }
  }
`;

// Main content area
export const Content = styled.main`
  flex: 1;
  padding: 24px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  &::-webkit-scrollbar-track {
    background: #b9b9b9;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #9333EA;
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 0, 0, 0.7);
  }
  
  /* 5. Scrollbar Buttons (Arrows) */
  /* Note: You can't easily put an "icon" here, but you can style the box */
  &::-webkit-scrollbar-button:single-button {
    background-color: #f1f1f1;
    display: block;
    background-size: 10px;
    background-repeat: no-repeat;
  }

  /* Up Arrow Icon */
  &::-webkit-scrollbar-button:single-button:vertical:decrement {
    height: 12px;
    width: 12px;
    background-position: center 4px;
    /* This is a tiny black triangle (ASCII arrow) */
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='rgb(147, 51, 234)'><polygon points='50,00 0,50 100,50'/></svg>");
  }

  /* Down Arrow Icon */
  &::-webkit-scrollbar-button:single-button:vertical:increment {
    height: 12px;
    width: 12px;
    background-position: center 2px;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='rgb(147, 51, 234)'><polygon points='0,0 100,0 50,50'/></svg>");
  }
`;

