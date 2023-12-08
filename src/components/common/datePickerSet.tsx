import { Button, Col, Dropdown, Row, Stack } from "react-bootstrap"
import DatePickerComponent from "../storage-section/datePicker"
import { useEffect } from "react"

interface IDatePickerSet {
    date: Date
    setDate: (date: Date) => void
    time: number
    setTime: (time: number) => void
    amPm: boolean
    setAmPm: (amPm: boolean) => void
    variant: string
}

type DatePickerProps = {
    dateData: IDatePickerSet
}

export const DatePickerSet = (props: DatePickerProps) => {
    const { date, setDate, amPm, setAmPm, time, setTime, variant } =
        props.dateData

    useEffect(() => {
        if (date.getHours() >= 12) {
            // pm
            setAmPm(false)
            setTime(time - 12)
        } else if (date.getHours() < 12) {
            setAmPm(true)
            setTime(time)
        }
    }, [])
    return (
        <div>
            <Stack gap={1}>
                <div style={{ display: "flex" }}>
                    <Col>
                        <DatePickerComponent
                            targetDate={date}
                            setTargetDate={setDate}
                            variant={variant}
                        />
                    </Col>
                </div>
                <div style={{ display: "flex" }}>
                    <Button
                        variant={variant}
                        style={{
                            fontSize: "1.5rem",
                            width: "80px",
                            marginRight: "10px",
                        }}
                        onClick={() => setAmPm(!amPm)}
                    >
                        {amPm ? "AM" : "PM"}
                    </Button>
                    <Dropdown>
                        <Dropdown.Toggle
                            style={{
                                fontSize: "1.5rem",
                            }}
                            variant={variant}
                            id='dropdown-hour'
                        >{`${time}시`}</Dropdown.Toggle>
                        <Dropdown.Menu>
                            {Array.from({ length: 12 }, (_, i) => (
                                <Dropdown.Item
                                    onClick={() => setTime(i)}
                                    key={"ti" + i}
                                >
                                    {i}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </Stack>
        </div>
    )
}
