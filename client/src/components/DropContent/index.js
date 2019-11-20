import React from "react"
import {
  Box,
  Button,
  Keyboard,
  Calendar,
  MaskedInput,
} from "grommet"
const DropContent = ({ date: initialDate, time: initialTime, onClose }) => {
  const [date, setDate] = React.useState()
  const [time, setTime] = React.useState()

  const close = () => onClose(date || initialDate, time || initialTime)

  return (
    <Box align="center">
      <Calendar
        animate={false}
        date={date || initialDate}
        onSelect={setDate}
        showAdjacentDays={false}
      />
      <Box flex={false} pad="medium" gap="medium">
        <Keyboard
          onEnter={event => {
            event.preventDefault() // so drop doesn't re-open
            close()
          }}
        >
          <MaskedInput
            mask={[
              {
                length: [1, 2],
                options: [
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  "10",
                  "11",
                  "12"
                ],
                regexp: /^1[1-2]$|^[0-9]$/,
                placeholder: "hh"
              },
              { fixed: ":" },
              {
                length: 2,
                options: ["00", "15", "30", "45"],
                regexp: /^[0-5][0-9]$|^[0-9]$/,
                placeholder: "mm"
              },
              { fixed: " " },
              {
                length: 2,
                options: ["am", "pm"],
                regexp: /^[ap]m$|^[AP]M$|^[aApP]$/,
                placeholder: "ap"
              }
            ]}
            value={time || initialTime}
            name="maskedInput"
            onChange={event => setTime(event.target.value)}
          />
        </Keyboard>
        <Box flex={false}>
          <Button label="Done" onClick={close} />
        </Box>
      </Box>
    </Box>
  )
}

export default DropContent