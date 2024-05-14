import toast, {Toaster} from "react-hot-toast"
import {
	addCategory,
	addOrder,
	deleteProduct,
	exchangeCategoryOrder,
	exchangeProductsOrder,
	updateProduct,
	updateProductsAfterOrder,
} from "../../apis/stockApi"
import {backgroundColors, cardColors} from "../../utils/consts/colors"
import "./button.css"
import "./modal.css"
import useFBFetch from "../../hooks/useFetch"
import {fbCollections} from "../../utils/consts/constants"
import {
	StockCategory,
	StockOrderItem,
	StockProduct,
} from "../../utils/types/stockTypes"
import {useEffect, useMemo, useState} from "react"
import {StockModal} from "../../components/stock-section/stockModal"
import {useNavigate} from "react-router-dom"
import {AiFillSetting} from "react-icons/ai"
import {useMediaQuery} from "react-responsive"
import styled from "styled-components"

export const StockScreen = () => {
	const navigate = useNavigate()
	const [isEditMode, setEditMode] = useState(false)

	const [newCatName, setNewCatName] = useState("")
	const [showNCModal, setShowNCModal] = useState(false)
	const [currentId, setCurrentId] = useState("") //doc

	const [newPrdName, setNewPrdName] = useState("")
	const [newPrdCnt, setNewPrdCnt] = useState(0)
	const [colorNumber, setColorNumber] = useState(0)
	const cardColor = useMemo(() => {
		return Object.values(cardColors)[colorNumber]
	}, [colorNumber])
	const [showNPModal, setShowNPModal] = useState(false)

	const [showEditModal, setShowEditModal] = useState(false)
	const [currentPrd, setCurrentPrd] = useState<StockProduct>()
	const [currentCat, setCurrentCat] = useState("")
	const {data, refetch} = useFBFetch<StockCategory>(fbCollections.sp2Stock)
	const isMobile = useMediaQuery({query: "(max-width: 1224px)"})
	const [orderList, setOrderList] = useState<StockOrderItem[]>([])

	const handleCloseModal = () => {
		setShowNCModal(false)
		setShowNPModal(false)
		setShowEditModal(false)
		setNewCatName("")
		setNewPrdName("")
		setNewPrdCnt(0)
		setCurrentId("")
	}

	const handleInputChange = (e: any) => {
		setNewCatName(e.target.value)
	}

	const onShowAddPrdModal = (id: string) => {
		setCurrentId(id)
		setShowNPModal(true)
	}
	const goToHome = () => {
		navigate("../")
	}
	const goToOrders = () => {
		navigate("orders")
	}
	const onAddCategoryClick = () => {
		if (data.filter((datum) => datum.catName === newCatName).length !== 0) {
			toast.error("동일한 카테고리가 존재합니다")
			return
		}
		let max = -1
		data.forEach((datum) => {
			if (datum.order > max) {
				max = datum.order
			}
		})
		newCatName
			? addCategory(newCatName, max + 1).then(() => {
					setShowNCModal(false)
					refetch()
			  })
			: toast("카테고리 명을 입력해주세요")
	}

	const onAddProductClick = () => {
		if (
			newPrdName &&
			data
				.filter((datum) => datum.docId === currentId)
				.filter((datum) => {
					if (datum.hasOwnProperty("products")) {
						const names = datum.products.map((prd) => prd.prdName)
						return names.includes(newPrdName)
					} else {
						return false
					}
				}).length > 0
		) {
			toast.error("동일한 품목이 있습니다.")
			return
		}
		let max = -1
		data
			.filter((datum) => datum.docId === currentId)
			.forEach((datum) => {
				console.log("docid: ", datum.docId)

				console.log("pds: ", datum.products)

				datum.products.forEach((prd) => {
					console.log("prev: ", prd.prdOrder, ", max: ", max)
					console.log(prd.prdOrder > max)

					if (prd.prdOrder > max) {
						max = prd.prdOrder
						console.log("max: ", max)
					}
				})
			})

		console.log("final max : ", max)
		newPrdName &&
			updateProduct(
				currentId,
				newPrdName,
				newPrdCnt,
				max + 1,
				cardColor,
				null,
			).then(async () => {
				setShowNPModal(false)
				setNewPrdName("")
				setNewPrdCnt(0)
				refetch()
			})
	}

	const onDeleteProductClick = (docId: string, pd: StockProduct) => {
		const ok = window.confirm("해당 상품을 리스트에서 삭제합니까?")
		if (ok) {
			deleteProduct(docId, pd).then((r) => {
				toast.success("삭제완료")
				refetch()
				setOrderList([])
				setShowEditModal(false)
			})
		}
	}

	const onModifyProductClick = (pd: StockProduct) => {
		console.log(currentId, newPrdName, newPrdCnt, pd.prdName)
		deleteProduct(currentId, {
			prdOrder: pd.prdOrder,
			prdName: pd.prdName,
			prdCnt: pd.prdCnt,
			color: pd.color,
		}).then(async () => {
			updateProduct(
				currentId,
				newPrdName,
				newPrdCnt,
				pd.prdOrder,
				cardColor,
				pd.prdName,
			).then(async () => {
				addOrder([
					{
						catId: currentId,
						prdName: pd.prdName,
						change: currentPrd ? newPrdCnt - currentPrd.prdCnt : -99,
						curStock: newPrdCnt,
						catName: currentCat,
					},
				])
				setShowEditModal(false)
				refetch()
			})
		})
	}

	const onExchangeCategoryOrderClick = (nCatId: string, sCatId: string) => {
		console.log("nCId", nCatId)
		console.log("sId", sCatId)
		exchangeCategoryOrder(nCatId, sCatId).then(() => {
			toast.success("변경완료")
			refetch()
		})
	}

	const onExchangeProductOrderClick = (
		catId: string,
		lPd: StockProduct,
		rPd: StockProduct,
	) => {
		exchangeProductsOrder(catId, lPd, rPd).then(() => {
			toast.success("변경 완료")
			refetch()
		})
	}

	const onProductClick = (docId: string, catName: string, pd: StockProduct) => {
		if (isEditMode) {
			setCurrentPrd(pd)
			setCurrentCat(catName)
			setShowEditModal(true)
			setCurrentId(docId)
			setNewPrdName(pd.prdName)
			setNewPrdCnt(pd.prdCnt)
		} else {
			if (pd.prdCnt === 0) {
				toast.error("재고가 없습니다.")
				return
			}

			const existing = orderList.find((order) => order.prdName === pd.prdName)
			if (existing) {
				const newOrderList = orderList.filter(
					(order) => order.prdName !== pd.prdName,
				)
				if (existing.change === pd.prdCnt) {
					toast.error("재고가 없습니다.")
				}
				let newOrder = {
					catId: docId,
					catName: existing.catName,
					prdName: pd.prdName,
					change:
						//2개 재고 클릭
						existing.change * -1 < pd.prdCnt
							? existing.change - 1
							: existing.change,
					curStock: 0,
				}
				newOrder.curStock = pd.prdCnt + newOrder.change
				console.log(
					pd.prdCnt,
					existing.change,
					newOrder.change,
					newOrder.curStock,
				)
				newOrderList.push(newOrder)

				setOrderList(newOrderList)
			} else {
				const newCat: StockOrderItem = {
					catId: docId,
					catName: catName,
					prdName: pd.prdName,
					change: -1,
					curStock: pd.prdCnt - 1,
				}
				setOrderList(
					[...orderList, newCat].sort(
						(a, b) => b.catName.charCodeAt(0) - a.catName.charCodeAt(0),
					),
				)
			}
		}
	}

	const onSubmitClick = () => {
		if (orderList.length === 0) {
			toast.error("아직 담은 상품이 없습니다.")
		} else {
			const cnt = orderList.reduce((prev, curr) => {
				return curr.change + prev
			}, 0)
			console.log(cnt)
			addOrder(orderList).then(async (result) => {
				// 주문 후 재고 업데이트
				updateProductsAfterOrder(orderList).then(() => {
					toast("출고완료")
					refetch()
				})
				setOrderList([])
				toast.success("완료")
				await refetch()
			})
			toast(`${cnt}`)
		}
	}

	useEffect(() => {
		console.log(colorNumber)
	}, [colorNumber])

	const onColorSelectorClick = () => {
		if (colorNumber < 5) setColorNumber(colorNumber + 1)
		else setColorNumber(0)
	}
	const onDeleteFromBucketClick = (order: StockOrderItem) => {
		const newOrderList = orderList.filter((o) => o.prdName !== order.prdName)

		setOrderList(newOrderList)
	}

	useEffect(() => {
		console.log(orderList)
	}, [orderList])

	useEffect(() => {
		console.log(cardColor)
	}, [cardColor])
	return (
		<div
			style={{
				width: isMobile ? "100vw" : "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				backgroundColor: backgroundColors.consign,
				padding: "20px 10px",
			}}>
			<Toaster />
			<div style={{display: "flex", justifyContent: "space-evenly"}}>
				<button className="btn-two green small" onClick={goToHome}>
					뒤로
				</button>
				<h1>상품 재고 관리</h1>
				<button className="btn-two small blue" onClick={goToOrders}>
					기록
				</button>
				<AiFillSetting
					style={{width: "30px", height: "30px"}}
					onClick={() => setEditMode(!isEditMode)}
				/>
			</div>
			{showNCModal && (
				<StockModal>
					<h1>카테고리 추가</h1>
					<input
						style={{width: "30%", minWidth: "10rem"}}
						type="text"
						value={newCatName}
						onChange={handleInputChange}
						placeholder="카테고리 명"
					/>
					<div
						style={{
							display: "flex",
							width: "10rem",
							justifyContent: "space-between",
						}}>
						<span className="close" onClick={handleCloseModal}>
							취소
						</span>
						<span className="close" onClick={onAddCategoryClick}>
							확인
						</span>
					</div>
				</StockModal>
			)}
			{showNPModal && (
				<StockModal>
					<h1>상품 추가</h1>
					<ModalLineDiv>
						<p style={{width: "4rem", textAlign: "center", margin: "0"}}>
							상품명
						</p>
						<input
							style={{width: "40%", minWidth: "10rem"}}
							type="text"
							value={newPrdName}
							onChange={(e) => setNewPrdName(e.target.value)}
							// placeholder="상품명"
						/>
					</ModalLineDiv>
					<ModalLineDiv
						style={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							marginBottom: "4px",
						}}>
						<p style={{width: "4rem", textAlign: "center", margin: "0"}}>
							수량
						</p>
						<ModalLineDiv>
							<button
								style={{width: "3rem"}}
								onClick={() => setNewPrdCnt(newPrdCnt > 1 ? newPrdCnt - 1 : 0)}>
								-
							</button>
							<input
								style={{width: "3rem", minWidth: "4rem"}}
								type="text"
								value={newPrdCnt}
								onChange={(e) => setNewPrdCnt(parseInt(e.target.value))}
								placeholder="수량"
							/>
							<button
								style={{width: "3rem"}}
								onClick={() => setNewPrdCnt(newPrdCnt + 1)}>
								+
							</button>
						</ModalLineDiv>
					</ModalLineDiv>
					<ModalLineDiv>
						<p style={{width: "6rem", textAlign: "center", margin: "0"}}>
							컬러(hex)
						</p>
						<button
							style={{
								backgroundColor: Object.values(cardColors)[colorNumber],
								width: "8rem",
								height: "100%",
							}}
							onClick={onColorSelectorClick}
						/>
					</ModalLineDiv>
					<div
						style={{
							display: "flex",
							width: "10rem",
							justifyContent: "space-between",
						}}>
						<span className="close" onClick={handleCloseModal}>
							취소
						</span>
						<span className="close" onClick={() => onAddProductClick()}>
							확인
						</span>
					</div>
				</StockModal>
			)}
			{showEditModal && currentPrd && (
				<StockModal>
					<h1>상품 수정</h1>
					<ModalLineDiv>
						<p style={{width: "4rem", textAlign: "center", margin: "0"}}>
							상품명
						</p>
						<input
							style={{width: "40%", minWidth: "10rem"}}
							type="text"
							// value={newPrdName}
							defaultValue={currentPrd.prdName}
							onChange={(e) => setNewPrdName(e.target.value)}
							// placeholder="상품명"
						/>
					</ModalLineDiv>
					<ModalLineDiv>
						<p style={{width: "4rem", textAlign: "center", margin: "0"}}>
							수량
						</p>
						<ModalLineDiv>
							<button
								style={{width: "3rem"}}
								onClick={() => setNewPrdCnt(newPrdCnt > 1 ? newPrdCnt - 1 : 0)}>
								-
							</button>
							<input
								style={{width: "3rem", minWidth: "4rem"}}
								type="text"
								value={newPrdCnt}
								onChange={(e) => setNewPrdCnt(parseInt(e.target.value))}
								placeholder="수량"
							/>
							<button
								style={{width: "3rem"}}
								onClick={() => setNewPrdCnt(newPrdCnt + 1)}>
								+
							</button>
						</ModalLineDiv>
					</ModalLineDiv>
					<ModalLineDiv>
						<p style={{width: "6rem", textAlign: "center", margin: "0"}}>
							컬러(hex)
						</p>
						<button
							style={{
								backgroundColor: Object.values(cardColors)[colorNumber],
								width: "8rem",
								height: "100%",
							}}
							onClick={onColorSelectorClick}
						/>
					</ModalLineDiv>
					<div
						style={{
							display: "flex",
							width: "14rem",
							justifyContent: "space-between",
						}}>
						<span
							className="close"
							onClick={() => onDeleteProductClick(currentId, currentPrd)}>
							삭제
						</span>
						<span className="close" onClick={handleCloseModal}>
							취소
						</span>
						<span
							className="close"
							onClick={() => onModifyProductClick(currentPrd)}>
							확인
						</span>
					</div>
				</StockModal>
			)}
			<div
				style={{
					width: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}>
				{data
					.sort((a, b) => a.order - b.order)
					.map((datum, idx) => (
						<div
							style={{
								width: "100%",
								display: "flex",
								flexDirection: "column",
								maxWidth: "1200px",
							}}>
							<div
								style={{
									width: "100%",
									minHeight: "1rem",
									border: "1px solid #545454",
									marginTop: "10px",
									backgroundColor: "#faf9f9",
									borderRadius: "4px",
								}}>
								{datum.catName}
							</div>
							<div
								style={{
									display: "flex",
									whiteSpace: "nowrap",
									overflow: "scroll",
									overflowX: "auto",
									overflowY: "hidden",
									msOverflowStyle: isMobile ? "none" : "scrollbar",
									scrollbarWidth: isMobile ? "none" : "thin",
								}}>
								{datum.products &&
									datum.products
										.sort((a, b) => a.prdOrder - b.prdOrder)
										.map((pd, idx) => (
											<div>
												<button
													className="btn-two orange large"
													style={{
														maxWidth: "13rem",
														minWidth: "10rem",
														padding: "10px",
														height: "8rem",
														maxHeight: "8rem",
														backgroundColor:
															pd.color && pd.color !== ""
																? pd.color.charAt(0) === "#"
																	? `${pd.color}`
																	: `#${pd.color}`
																: undefined,
													}}
													onClick={() =>
														onProductClick(datum.docId, datum.catName, pd)
													}>
													<h4 style={{whiteSpace: "normal"}}>{pd.prdName}</h4>
													<h5 style={{margin: "0"}}>재고:{pd.prdCnt}개</h5>
												</button>
												{isEditMode && idx < datum.products.length - 1 && (
													<button
														onClick={() =>
															onExchangeProductOrderClick(
																datum.docId,
																datum.products[idx],
																datum.products[idx + 1],
															)
														}>
														{"↔"}
													</button>
												)}
											</div>
										))}
								{isEditMode && (
									<button
										className="btn-two green large"
										onClick={() => onShowAddPrdModal(datum.docId)}
										style={{
											width: "10rem",
											padding: "10px",
											maxHeight: "8rem",
										}}>
										항목
										<br />
										추가하기
									</button>
								)}
							</div>
							{isEditMode && idx < data.length - 1 && (
								<button
									style={{width: "20%"}}
									onClick={() =>
										onExchangeCategoryOrderClick(
											data[idx].docId,
											data[idx + 1].docId,
										)
									}>
									↕
								</button>
							)}
						</div>
					))}
				{isEditMode && (
					<button
						style={{width: "50%", maxWidth: "800px"}}
						onClick={() => setShowNCModal(!showNCModal)}>
						카테고리 추가
					</button>
				)}
			</div>
			<div
				style={{
					display: "flex",
					width: isMobile ? "90%" : "60%",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: "#e9e9e9",
					padding: "10px",
				}}>
				<div
					style={{
						display: "flex",
						width: "100%",
						minHeight: "1rem",
						justifyContent: "center",
						alignItems: "center",
						border: "1px solid #545454",
						backgroundColor: "#faf9f9",
						borderRadius: "4px",
					}}>
					주문 내용
				</div>
				<div
					style={{
						width: "100%",
						minHeight: "30px",
						justifyContent: "center",
						alignItems: "center",
						border: "1px solid #545454",
						backgroundColor: "#faf9f9",
						borderRadius: "4px",
						marginTop: "6px",
					}}>
					{data.map((datum) => (
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								justifyContent: "center",
								alignItems: "center",
							}}>
							{orderList.filter((order) => order.catName === datum.catName)
								.length > 0 ? (
								<h4>{datum.catName}</h4>
							) : (
								<></>
							)}

							{orderList
								.filter((order) => order.catName === datum.catName)
								.sort((a, b) => a.prdName.localeCompare(b.prdName))
								.map((order) => (
									<div
										style={{
											display: "flex",
											width: "200px",
											justifyContent: "space-evenly",
											alignItems: "center",
											marginBottom: "2px",
										}}>
										<h6 style={{margin: "0"}}>{order.prdName}</h6>
										<h6 style={{margin: "0"}}> ×{-order.change}</h6>
										<button
											style={{padding: "2px"}}
											className="btn-two black small"
											onClick={() => onDeleteFromBucketClick(order)}>
											<h6 style={{margin: "0"}}>제거</h6>
										</button>
									</div>
								))}
						</div>
					))}
				</div>
			</div>

			<div style={{display: "flex"}}>
				<button
					className="btn-two orange large"
					onClick={() => setOrderList([])}>
					비우기
				</button>
				<button
					disabled={orderList.length === 0}
					className="btn-two red large"
					onClick={onSubmitClick}>
					제출
				</button>
			</div>
		</div>
	)
}

const ModalLineDiv = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	margin-bottom: 4px;
	height: 40px;
`
