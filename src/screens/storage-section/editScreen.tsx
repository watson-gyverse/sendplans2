import { useContext, useEffect, useRef, useState } from "react"
import toast, { Toaster } from "react-hot-toast"
import { EditCard } from "../../components/storage-section/editCard"
import { Button, Modal, Stack } from "react-bootstrap"
import EditModal from "../../components/storage-section/editModal"
import { CSVType, MeatInfoWithCount } from "../../utils/types/meatTypes"
import { csvHeaders, sessionKeys } from "../../utils/consts/constants"
import { CSVLink } from "react-csv"

export default function EditScreen() {
    const [show, setShow] = useState(false)

    const session = sessionStorage
    const initItems = session.getItem(sessionKeys.storageItems)
    const [items, setItems] = useState<MeatInfoWithCount[]>(
        JSON.parse(initItems ? initItems : "")
    )

    const [recentMeatInfo, setRecentMeatInfo] = useState<
        MeatInfoWithCount | undefined
    >()
    let [csvData, setCSVData] = useState<CSVType[]>([])

    const csvLink = useRef<
        CSVLink & HTMLAnchorElement & { link: HTMLAnchorElement }
    >(null)

    useEffect(() => {
        console.log("**init use effect**")
        console.log(items)
    }, [])

    useEffect(() => {
        if (recentMeatInfo === undefined) {
            console.error("recentMeatInfo : undefined")
            return
        }
        console.log("++meatinfo changed++")

        console.log(recentMeatInfo)
        let tempList = items.filter((item) => {
            return item.meatNumber !== recentMeatInfo.meatNumber
        })
        tempList.push(recentMeatInfo)
        setItems(tempList)
        makeCSVData(tempList)
    }, [recentMeatInfo])

    const makeCSVData = (items: MeatInfoWithCount[]) => {
        let list: CSVType[] = []
        for (let item of items) {
            for (let i = 0; i < item.count; i++) {
                list = [
                    ...list,
                    {
                        storedDate: item.storedDate,
                        meatNumber: item.meatNumber!!,
                        entryNumber: String(i).padStart(3, "0"),
                        species: item.species,
                        origin: item.origin!!,
                        gender: item.gender!!,
                        grade: item.grade!!,
                        cut: item.cut,
                        freeze: item.freeze!!,
                        price: item.price!!,
                    },
                ]
            }
        }
        setCSVData(list)
    }

    const csvLinkClick = () => {
        csvLink?.current?.link.click()
    }

    return (
        <div>
            <Toaster />
            <Button onClick={() => toast.success("쓰러갑시다")}>뒤로</Button>
            <Stack gap={2}>
                <h5>전부 입력하기 전에 못 내리신다고</h5>
                {items
                    .sort((a, b) => Number(a.meatNumber) - Number(b.meatNumber))
                    .map((item: MeatInfoWithCount) => {
                        return (
                            <EditCard
                                key={item.meatNumber!! + item.price}
                                meatInfo={item}
                                clickEvent={() => {
                                    setShow(!show)
                                    setRecentMeatInfo(item)
                                }}
                            />
                        )
                    })}
            </Stack>
            <CSVLink
                data={csvData}
                headers={csvHeaders}
                asyncOnClick={true}
                filename={`${new Date().toLocaleString("ko-KR")}.csv`}
                ref={csvLink}
            />
            <Button onClick={csvLinkClick}>csv다운로드</Button>
            <Modal
                show={show}
                onHide={() => setShow(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>고기 정보 입력/수정</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {recentMeatInfo !== undefined ? (
                        <EditModal
                            meatInfo={recentMeatInfo}
                            setMeatInfo={setRecentMeatInfo}
                            setClose={() => setShow(false)}
                        />
                    ) : (
                        <></>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    )
}
