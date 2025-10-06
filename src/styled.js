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
  width: 250px;
  background: linear-gradient(180deg, #ae00ffff, #ae00ffff);
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
`;
