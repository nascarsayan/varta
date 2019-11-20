import React, { Component } from 'react'
import { grommet } from "grommet/themes"
import { Download, Schedule, Search } from 'grommet-icons'
import { Grommet, TextInput, Box, Button, Text, DropButton } from 'grommet'
import fileDownload from 'js-file-download'
import { ClipLoader } from 'react-spinners'

import DropContent from './components/DropContent'
import IndMap from './components/IndMap'
class App extends Component {
  state = {
    points: [],
    suggestions: [],
    term: '',
    open: false,
    date: '',
    time: '12:00 am',
    loading: false
  }

  onSearch = async (suggestions, term, date, time) => {
    this.setState({ loading: true })
    const url = `/api/query/recent?term=${term}${date ? `&since=${new Date(`${new Date(date).toLocaleDateString()} ${time}`).toISOString()}` : ''}`
    const resRaw = await fetch(url)
    const data = await resRaw.json()
    console.log(data)
    this.setState({ points: data, loading: false, suggestions: [...suggestions, term] })
  }

  dateToJSON = (date) => {
    const local = new Date(date)
    local.setMinutes(date.getMinutes() - date.getTimezoneOffset())
    return local.toJSON().slice(0, 10)
  }

  onDownload = async (jsonstr) => {
    const {
      state: {
        term
      }
    } = this
    const curdate = this.dateToJSON(new Date())
    fileDownload(JSON.stringify(jsonstr, null, 2), `${term}-${curdate}.json`)
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
        loading
      },
      onSearch,
      onDownload
    } = this
    const onClose = (nextDate, nextTime) => {
      this.setState({ date: nextDate, time: nextTime, open: false })
      setTimeout(() => this.setState({ open: undefined }), 1)
    }
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
                  <Box align="center" pad={{ right: 'small' }}>
                    <Text textAlign="center">
                      Search For
                  </Text>
                  </Box>
                  <Box width="medium">
                    <TextInput
                      placeholder='Tweets'
                      value={term}
                      onChange={e => this.setState({ term: e.target.value })}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          onSearch(suggestions, term, date, time)
                        }
                      }}
                    />
                  </Box>
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
                  <Box overflow="hidden" background="accent-1" round="full">
                    <Button
                      icon={<Search />}
                      color='accent-1'
                      onClick={e => {
                        onSearch(suggestions, term, date, time)
                      }}
                    />
                  </Box>
                </Box>
                <Box margin={{ left: '1rem' }}>
                  <Button
                    icon={<Download />}
                    label={`Download ${points.length} tweets as JSON`}
                    color={'#C6C6C6'}
                    onClick={_ => onDownload(points)}
                    disabled={points.length === 0}
                  />
                </Box>
              </Box>
              <Box>
                <IndMap points={points} />
              </Box>
            </React.Fragment>
          )
        }
      </Grommet>
    )
  }
}

export default App
