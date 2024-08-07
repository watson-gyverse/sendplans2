/* eslint-disable react-hooks/exhaustive-deps */
import {useEffect, useState} from "react"
import {backgroundColors} from "../../utils/consts/colors"
import {ConsignTable} from "../../components/consign-section/table"
import {ConsignData} from "../../utils/types/otherTypes"
import AddModal from "../../components/consign-section/addModal"
import useFBFetch from "../../hooks/useFBFetch"
import {fbCollections} from "../../utils/consts/constants"
import {where} from "firebase/firestore"
import {Toaster} from "react-hot-toast"
import {useNavigate} from "react-router-dom"

export const ConsignScreen = () => {
	const navigate = useNavigate()
	const [client, setClient] = useState("")
	const [meatNumber, setMeatNumber] = useState("")
	const [isL, setL] = useState(false)
	const [canAddModalShow, setCanAddModalShow] = useState(false)
	const [addModalShow, setAddModalShow] = useState(false)

	const {data, refetch} = useFBFetch<ConsignData>(fbCollections.sp2Consign, [
		where("client", "==", client),
	])

	useEffect(() => {
		console.log(data)
	}, [data])

	const onSearchClient = () => {
		console.log(`검색 ${client}`)
		refetch()
	}
	const onLClick = () => {
		setL(!isL)
	}
	const onMeatNumberChange = (e: string) => {
		if (isL) setMeatNumber("L".concat(e))
		else setMeatNumber(e)
	}
	const onAddButtonClick = () => {
		console.log(meatNumber)
		setAddModalShow(true)
	}

	useEffect(() => {
		if (isL) {
			setMeatNumber("L".concat(meatNumber))
		} else {
			setMeatNumber(meatNumber.replace("L", ""))
		}
	}, [isL])

	useEffect(() => {
		setCanAddModalShow(client.length > 1 && meatNumber.length >= 12)
	}, [meatNumber, client])

	useEffect(() => {
		if (!canAddModalShow) {
			console.log("닫혀있음")
			onSearchClient()
		}
	}, [canAddModalShow])
	const onBackClick = () => {
		navigate("../")
	}
	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				backgroundColor: backgroundColors.consign,
				padding: "20px 10px",
			}}>
			<Toaster />
			<div
				style={{
					width: "400px",
					display: "flex",
					flexDirection: "column",
				}}></div>

			{/* 위탁사 검색 */}
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					justifyContent: "center",
				}}>
				<button style={{width: "60px"}} onClick={onBackClick}>
					뒤로
				</button>
				<input
					style={{width: "10rem"}}
					type="text"
					id="clientInput"
					placeholder="위탁사 명"
					onChange={(e) => setClient(e.target.value)}
				/>
				<button onClick={onSearchClient}>조회</button>
			</div>
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					justifyContent: "center",
				}}>
				<button
					onClick={onLClick}
					style={{
						outline: "none",
						backgroundColor: isL ? "#45f4a5" : "#6b8077",
					}}>
					L
				</button>
				<input
					style={{width: "15rem"}}
					type="number"
					placeholder="지금 추가할 이력번호 입력"
					onChange={(e) => onMeatNumberChange(e.target.value)}
				/>
				<button disabled={!canAddModalShow} onClick={onAddButtonClick}>
					+
				</button>
			</div>

			<ConsignTable
				data={data.sort((a, b) => (a.id < b.id ? -1 : 0))}
				refetch={refetch}
			/>
			<AddModal
				client={client}
				meatNumber={meatNumber}
				show={addModalShow}
				setShow={setAddModalShow}
			/>
		</div>
	)
}

// function makeData(): ConsignData[] {
// 	var a: ConsignData[] = [
// 		{
// 			id: 1,
// 			client: "까매용",
// 			meatNumber: "L111122223333",
// 			cut: "삼겹살",
// 			initWeight: 12.21,
// 			initDate: "2024-03-18 16",
// 			items: [],
// 			afterWeight: 14,
// 			cutWeight: null,
// 		},
// 		{
// 			id: 2,
// 			client: "까매용",
// 			meatNumber: "L342343234323",
// 			cut: "목살",
// 			initWeight: 14.22,
// 			initDate: "2024-03-18 16",
// 			items: [],
// 			afterWeight: 12.21,
// 			cutWeight: 11.11,
// 		},
// 	]
// 	return a
// }
