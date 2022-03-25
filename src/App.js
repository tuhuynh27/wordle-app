import React, {
  useMemo,
  createRef,
  useState,
  useEffect,
  useCallback
} from 'react'
import './styles.scss'

const inputArr = () => Array(5).fill(null)
const initialValues = () => Array(5).fill('')
const initialCheckArr = () => Array(5).fill(0)

async function getAnswers() {
  const resp = await fetch(
    'https://raw.githubusercontent.com/dolph/dictionary/master/popular.txt'
  )
  const text = await resp.text()
  const arr = text.split('\n').filter((e) => e.length === 5)
  return arr
}

let answers = null

function App() {
  const [screenStage, setScreenStage] = useState(0)
  const [answer, setAnswer] = useState('testa')
  const [point, setPoint] = useState(0)
  const [values, setValues] = useState(initialValues())
  const inputRefs = useMemo(() => inputArr().map(() => createRef()), [])
  const [checkArr, setCheckArr] = useState(initialCheckArr())
  const [tried, setTried] = useState(0)

  const calcFn = useCallback(() => {
    const word = values.join('')
    if (word === answer) {
      setScreenStage(1)
      setPoint((p) => p + 1)
      setTimeout(() => {
        setScreenStage(0)
        setAnswer(answers[Math.floor(Math.random() * answers.length)])
        setTried(0)
        setCheckArr(initialCheckArr())
        setValues(initialValues())
        if (inputRefs[0].current) {
          inputRefs[0].current.focus()
        }
      }, 2000)
      return
    }
    if (word.length === 5) {
      setTried((t) => t + 1)
    }
    const answerArr = answer.split('')
    const newCheckArr = answerArr.map((e, i) => {
      if (answerArr.findIndex((e) => e === values[i]) === -1) {
        return 2
      }
      if (values[i] !== '' && e !== values[i]) {
        return 1
      }
      return 0
    })
    setCheckArr(newCheckArr)
  }, [answer, values, inputRefs])

  useEffect(() => {
    getAnswers().then((res) => {
      answers = res
      setAnswer(res[Math.floor(Math.random() * res.length)])
    })
  }, [])

  useEffect(() => {
    if (tried === 6) {
      setScreenStage(2)
      setTimeout(() => {
        setScreenStage(0)
        setAnswer(answers[Math.floor(Math.random() * answers.length)])
        setTried(0)
        setCheckArr(initialCheckArr())
        setValues(initialValues())
        if (inputRefs[0].current) {
          inputRefs[0].current.focus()
        }
      }, 2000)
    }
  }, [tried, inputRefs])

  useEffect(() => {
    calcFn()
  }, [calcFn])

  useEffect(() => {
    if (inputRefs[0].current) {
      inputRefs[0].current.focus()
    }
  }, [inputRefs])

  function inputHandler(e) {
    e.preventDefault()
    const idx = parseInt(e.target.getAttribute('idx'), 10)

    setValues((current) => {
      const fullFilled = idx === 0 && values.join('').length > 0
      const clone = fullFilled ? initialValues() : [...current]
      const value = e.target.value[e.target.value.length - 1]
      clone[idx] = value.toLowerCase()
      return clone
    })

    if (idx >= 4) {
      inputRefs[0].current.focus()
    } else {
      inputRefs[idx + 1].current.focus()
    }
  }

  function keyDownHandler(e) {
    const charCode = e.keyCode

    if (charCode === 8) {
      e.preventDefault()
    }

    if (
      (charCode > 64 && charCode < 91) ||
      (charCode > 96 && charCode < 123) ||
      charCode === 8
    ) {
      // Allowed
    } else {
      e.preventDefault()
    }
  }

  function onClickHandler(e) {
    const idx = parseInt(e.target.getAttribute('idx'), 10)
    if (idx !== 0) {
      setTried((t) => t + 1)
      inputRefs[0].current.focus()
    }
  }

  function getColor(code) {
    if (code === 0) {
      return 'none'
    }
    if (code === 1) {
      return 'wrong'
    }
    if (code === 2) {
      return 'notfound'
    }
  }

  return (
    <div className="app">
      <div className="main">
        {screenStage === 0 && (
          <React.Fragment>
            <h1>Wordle!</h1>
            <div className="guess-area">
              {inputArr().map((_, i) => (
                <input
                  key={i}
                  className={getColor(checkArr[i])}
                  value={values[i]}
                  idx={i}
                  ref={inputRefs[i]}
                  onChange={inputHandler}
                  onKeyDown={keyDownHandler}
                  onClick={onClickHandler}
                />
              ))}
            </div>
            <p>
              Your point is <strong>{point}</strong>, {6 - tried} chances left!
            </p>
          </React.Fragment>
        )}
        {screenStage === 1 && (
          <React.Fragment>
            <h1>Correct!</h1>
            <p>
              +1 point, your point now is <strong>{point}</strong>
            </p>
          </React.Fragment>
        )}
        {screenStage === 2 && (
          <React.Fragment>
            <h1>Failed!</h1>
            <p>
              Answer is '{answer.toUpperCase()}', your point now is{' '}
              <strong>{point}</strong>
            </p>
          </React.Fragment>
        )}
      </div>
      <div className="mobile">
        <div className="msg">
          <p>We don't not support mobile device, please visit this app on PC</p>
        </div>
      </div>
    </div>
  )
}

export default App
