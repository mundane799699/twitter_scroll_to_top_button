export const scrollToTopButtonStyle = {
  alignItems: 'center',
  background: '#ffffff',
  border: '1px solid rgb(207, 217, 222)',
  borderRadius: '16px',
  bottom: '75px',
  boxShadow:
    'rgba(101, 119, 134, 0.2) 0px 0px 15px, rgba(101, 119, 134, 0.15) 0px 0px 3px 1px',
  color: 'rgb(15, 20, 25)',
  cursor: 'pointer',
  display: 'flex',
  height: '56px',
  justifyContent: 'center',
  padding: '0',
  position: 'fixed',
  right: '32px',
  transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
  width: '56px',
  zIndex: '2147483647',
} as const;

export const scrollToTopButtonHoverStyle = {
  background: 'rgb(247, 249, 249)',
} as const;

export const scrollToTopIconStyle = {
  display: 'block',
  height: '32px',
  width: '32px',
} as const;
