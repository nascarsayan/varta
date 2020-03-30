import React, { Component } from 'react'
import { grommet } from "grommet/themes"
import { Download, Schedule, Search, Article, Twitter } from 'grommet-icons'
import { Grommet, TextInput, Box, Button, Text, DropButton, Anchor } from 'grommet'
import fileDownload from 'js-file-download'
import { ClipLoader } from 'react-spinners'

import DropContent from './components/DropContent'
import IndMap from './components/IndMap'
import News from './components/News'
// let news = require('./news.json')
class App extends Component {
  state = {
    points: [],
    suggestions: [],
    term: { 0: '', 1: '' },
    open: false,
    date: '',
    time: '12:00 am',
    loading: false,
    modes: ['tweets', 'news'],
    modeIcons: [Twitter, Article],
    modeIdx: 0,
    // news: { ...news, url: 'dummy.com', page: 1, totalResults: 100 },
    news: null,
    x: 'tweery02@itiomail.com',
    mapApiKeys: [
      '9bebc27282b84efcaa954863d4941083',
      'bf16058950954dc0bebe999eb2f7860a',
      'f3cdc75b027a401eb86f75797603e143',
      '63597f9ceaf64d919b8c7ebdc2a09e36',
      '27083a56a13a4d8d9f8f3f49784a40b7',
      '3338a065bf264729be16aa90618af025',
      '860fa055c0ed4ac9bb15464eec387996',
      'efc7eff7e801436b831e92f98ec28326',
      'b61b39d7c62948f0b391d2d9cf70c5db',
      'e98ccb0789f648f1ba3025c5464cdcfa'
    ],
    mapApiIndex: 0,
    newsPageSize: 20
  }

  onTwitterSearch = async (suggestions, term, date, time) => {
    this.setState({ loading: true })
    const url = `/api/query/recent?term=${term}${date ? `&since=${new Date(`${new Date(date).toLocaleDateString()} ${time}`).toISOString()}` : ''}`
    const resRaw = await fetch(url)
    const data = await resRaw.json()
    this.setState({ points: data, loading: false, suggestions: [...suggestions, term] })
  }

  onNewsSearch = async (term, date, time) => {
    let {
      state: {
        mapApiKeys,
        mapApiIndex
      }
    } = this
    const apiKey = mapApiKeys[mapApiIndex]
    const url = `https://newsapi.org/v2/everything?q=${term}${date ? `&from=${new Date(`${new Date(date).toLocaleDateString()} ${time}`).toISOString()}` : ''}&apiKey=${apiKey}`
    this.setState({ loading: true })
    const resRaw = await fetch(url)
    let data = await resRaw.json()
    data = { ...data, url, page: 1, totalResults: Math.min(data.totalResults, 100) }
    mapApiIndex = (mapApiIndex + 1) % mapApiKeys.length
    this.setState({ news: data, loading: false, mapApiIndex })
  }

  onNewsPageChange = async (page) => {
    const {
      state: {
        news: {
          url
        }
      }
    } = this
    // const maxPages = ~~((totalResults + newsPageSize - 1) / newsPageSize)
    this.setState({ loading: true })
    const resRaw = await fetch(`${url}&page=${page}`)
    let data = await resRaw.json()
    data = { ...data, url, page, totalResults: Math.min(data.totalResults, 100) }
    console.log(page, data)
    this.setState({ news: data, loading: false })
  }

  onModeChange = (mode) => {
    let {
      state: {
        modes
      }
    } = this
    this.setState({ modeIdx: modes.indexOf(mode) })
  }

  dateToJSON = (date) => {
    const local = new Date(date)
    local.setMinutes(date.getMinutes() - date.getTimezoneOffset())
    return local.toJSON().slice(0, 10)
  }

  getModeIcon = () => {
    const {
      state: {
        modeIdx,
        modes
      }
    } = this
    const mode = modes[modeIdx]
    if (mode === 'tweets') return <Twitter />
    if (mode === 'news') return <Article />
  }

  onDownload = async () => {
    const {
      state: {
        term,
        modes,
        modeIdx,
        points,
        news
      }
    } = this
    const curdate = this.dateToJSON(new Date())
    const mode = modes[modeIdx]
    let data
    if (mode === 'tweets') {
      data = points
    } else if (mode === 'news') {
      data = news
    }
    fileDownload(JSON.stringify(data, null, 2), `${mode}-${term[modeIdx]}-${curdate}.json`)
  }

  render() {
    const {
      state: {
        points,
        term,
        suggestions,
        open,
        date,
        time,
        loading,
        modes,
        modeIdx,
        news,
        newsPageSize,
      },
      getModeIcon,
      onTwitterSearch,
      onNewsSearch,
      onNewsPageChange,
      onDownload,
    } = this
    const onClose = (nextDate, nextTime) => {
      this.setState({ date: nextDate, time: nextTime, open: false })
      setTimeout(() => this.setState({ open: undefined }), 1)
    }
    let dataSize = 0
    if (modes[modeIdx] === 'tweets') {
      dataSize = points.length
    } else if (modes[modeIdx] === 'news' && news) {
      dataSize = news.articles.length
    }
    const nextModeIdx = (modeIdx + 1) % modes.length
    return (
      <Grommet full theme={grommet}>
        {(loading) ? (
          <Box fill={true} align="center" justify="center">
            <ClipLoader
              sizeUnit={"px"}
              size={150}
              color={'#36D7B7'}
              loading={loading}
            />
          </Box>
        ) : (
            <React.Fragment>
              <Box
                background="brand"
                align="center"
                as="footer"
                direction="row"
                flex={false}
                gap="medium"
                justify="between"
                pad="small"
                height="0.5rem"
              >
                <Text size="xsmall">
                  Developed by
                  <Anchor label=" Sayan Naskar (Department of CSE, IIT Kharagpur)," href="https://www.linkedin.com/in/nascarsayan" target="_blank" />
                  <Anchor label=" Saptarshi Ghosh (Department of CSE, IIT Kharagpur)," href="http://cse.iitkgp.ac.in/~saptarshi" target="_blank" />
                  <Anchor label=" Arnab Jana (Centre for Urban Science and Engineering, IIT Bombay)" href="http://cuse.iitb.ac.in/people/faculty/arnab-jana" target="_blank" />
                </Text>
              </Box>
              <Box
                align="center"
                justify="center"
                pad="medium"
                direction="row">
                <Box align="center"
                  justify="center"
                  margin={{ right: '1rem' }}
                  pad={{ vertical: '3px', horizontal: '1rem' }}
                  direction="row"
                  border={{ size: 'small', color: '#ededed' }}>
                  {/* <Box
                    align="center"
                    pad={{ right: 'small' }}
                    justify="center"
                    direction="row"
                    width="small"
                  >
                    <Select
                      options={modes}
                      value={modes[modeIdx]}
                      onChange={({ option }) => onModeChange(option)}
                    />
                  </Box> */}
                  <Button icon={getModeIcon()} />
                  <Box width="small">
                    <TextInput
                      placeholder='Term'
                      value={term[modeIdx]}
                      onChange={e => this.setState({ term: { ...term, [modeIdx]: e.target.value } })}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          if (modes[modeIdx] === 'tweets')
                            onTwitterSearch(suggestions, term[modeIdx], date, time)
                          else if (modes[modeIdx] === 'news')
                            onNewsSearch(term[modeIdx], date, time)
                        }
                      }}
                    />
                  </Box>
                  {
                    (modes[modeIdx] === 'tweets')
                      ?
                      <React.Fragment>
                        <Box align="center" pad={{ left: 'small' }}>
                          <Text textAlign="center">
                            since
                          </Text>
                        </Box>
                        <Box>
                          <DropButton
                            open={open}
                            onClose={() => this.setState({ open: false })}
                            onOpen={() => this.setState({ open: true })}
                            dropContent={
                              <DropContent date={date} time={time} onClose={onClose} />
                            }
                          >
                            <Box direction="row" gap="medium" align="center" pad="small">
                              <Text color={date ? undefined : "dark-5"}>
                                {date
                                  ? `${new Date(date).toLocaleDateString()} ${time}`
                                  : "Select date & time"}
                              </Text>
                              <Schedule />
                            </Box>
                          </DropButton>
                        </Box>
                      </React.Fragment>
                      :
                      null
                  }
                  <Box overflow="hidden" background="accent-1" round="full">
                    <Button
                      icon={<Search />}
                      color='accent-1'
                      onClick={e => {
                        if (modes[modeIdx] === 'tweets')
                          onTwitterSearch(suggestions, term[modeIdx], date, time)
                        else if (modes[modeIdx] === 'news')
                          onNewsSearch(term[modeIdx], date, time)
                      }}
                    />
                  </Box>
                </Box>
                <Box margin={{ left: '1rem' }}>
                  <Button
                    icon={<Download />}
                    label={`Download ${dataSize} ${modes[modeIdx]} as JSON`}
                    color={'#C6C6C6'}
                    onClick={_ => onDownload()}
                    disabled={dataSize === 0}
                  />
                </Box>
                <Box margin={{ left: '1rem' }}>
                  <Button
                    theme={{ button: { border: { radius: '0px' } } }}
                    label={`Go to ${modes[nextModeIdx]}${modes[nextModeIdx] === 'news' ? ' articles' : ''}`}
                    onClick={() => this.setState({ modeIdx: nextModeIdx })}
                  />
                </Box>
              </Box>
              {
                (modes[modeIdx] === 'tweets')
                  ? <Box><IndMap points={points} /></Box>
                  : null
              }
              {
                (modes[modeIdx] === 'news' && news)
                  ? <Box>
                    <News
                      {...{ news, onNewsPageChange, newsPageSize }}
                    >
                    </News>
                  </Box>
                  : null
              }
            </React.Fragment>
          )
        }
      </Grommet>
    )
  }
}

export default App
