import { StyleSheet } from 'aphrodite'

export default StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    alignSelf: 'center',
    maxWidth: '1090px',
    textAlign: 'center',
    margin: '10px 0'
  },
  title: {
    color: 'white',
    fontSize: '4em',
    lineHeight: 1.2,
    fontWeight: 900,
    textTransform: 'uppercase',
    margin: '0 0 20px'
  },
  backdrop: {
    color: '#fc1f4a',
    backgroundColor: 'white',
    padding: '0 10px'
  },
  text: {
    color: 'white',
    fontSize: '1.3em',
    fontWeight: 200,
    fontStyle: 'italic',
    padding: '0 55px',
    margin: '0 0 10px'
  }
})
