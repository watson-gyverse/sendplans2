export type MeatPreset = {
    storedDate: string
    species: string
    cut: string
}

export type MeatScanned = MeatPreset & {
    meatNumber: string | null
    //국산/수입
    origin: string | null
    //아래는 소만 조회되고 돼지는 직접 기입
    gender: string | null
    grade: string | null
}

export type MeatInfo = MeatScanned & {
    freeze: string | null
    price: string | null
    beforeWeight: number | null
    // fridgeNumber: string | null
    // //숙성고 번호
    // storageNumber: string | null

    //순번 001 002 ..
    entryNumber: string | null
}

export type MeatInfoWithCount = MeatInfo & {
    count: number
}

export type CSVType = {
    [index: string]: string
    storedDate: string
    meatNumber: string
    entryNumber: string
    species: string
    origin: string
    gender: string
    grade: string
    cut: string
    freeze: string
    price: string
}