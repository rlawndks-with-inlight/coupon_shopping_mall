import { useState } from "react"

const SortGroupBase = () => {
    const unKnownCategory = {
        'label' : '#',
        'childs' : [],
    }
    const bigCategoryGroup = []
    return {
        unKnownCategory, bigCategoryGroup
    }
}

const KorSorter = (categories)  => {
    // 대분류 그룹화. level 2
    const SortedKOR = () => {
        
        const { unKnownCategory, bigCategoryGroup } = SortGroupBase()
        const hangeulCodes = [
            {'label' : '가', 'limit_code': 45208, 'start_code': 44031},
            {'label' : '나', 'limit_code': 45796, 'start_code': 45208},
            {'label' : '다', 'limit_code': 46972, 'start_code': 45796},
            {'label' : '라', 'limit_code': 47560, 'start_code': 46972},
            {'label' : '마', 'limit_code': 48148, 'start_code': 47560},
            {'label' : '바', 'limit_code': 49324, 'start_code': 48148},
            {'label' : '사', 'limit_code': 50500, 'start_code': 49324},
            {'label' : '아', 'limit_code': 51088, 'start_code': 50500},
            {'label' : '자', 'limit_code': 52264, 'start_code': 51088},
            {'label' : '차', 'limit_code': 52852, 'start_code': 52264},
            {'label' : '카', 'limit_code': 53440, 'start_code': 52852},
            {'label' : '타', 'limit_code': 54028, 'start_code': 53440},
            {'label' : '파', 'limit_code': 54616, 'start_code': 54028},
            {'label' : '하', 'limit_code': 55204, 'start_code': 54616},
        ]       
        categories.forEach(category => {
            let firstTextCode = null
            let hangeulCode = null

            if(category.category_name?.length > 0) {
                firstTextCode = category.category_name.charCodeAt(0)
                hangeulCode = hangeulCodes.find(obj => firstTextCode >= obj.start_code && firstTextCode < obj.limit_code)   
            }
            if(hangeulCode) {
                let bigCateIdx = bigCategoryGroup.findIndex(obj => obj.label === hangeulCode.label)
                if(bigCateIdx === -1) {
                    // 대분류 카테고리에 없는 경우
                    bigCategoryGroup.push({
                        'label' : hangeulCode.label,
                        'childs' : [
                            category,
                        ]
                    })
                }
                else {
                    // 대분류 카테고리에 이미 존재하는 경우
                    bigCategoryGroup[bigCateIdx].childs.push(category)
                }
            }
            else {
                unKnownCategory.childs.push(category)
                console.log(unKnownCategory)
            }
        })

        bigCategoryGroup.forEach(category => {
            category.childs.sort((a, b) => a.category_name.localeCompare(b.category_name))
        })
        return [
            ...bigCategoryGroup.sort((a, b) => a.label.localeCompare(b.label)),
            unKnownCategory
        ]
    }
    return {
        SortedKOR
    }
}

const EngSorter = (categories) => {
    // 대분류 그룹화. level 2
    const isAddCategory = (category, bigCategoryGroup) => {
        for (let i = 0; i < bigCategoryGroup.length; i++) {
            let isAdded = bigCategoryGroup[i].childs.findIndex(obj => obj.id === category.id)
            if(isAdded !== -1) 
                return true
        }
        return false
    }

    const SortedENG = () => {
        // 카테고리 그룹 중 추가가 안된 카테고리 검색
        const { unKnownCategory, bigCategoryGroup } = SortGroupBase()
        categories?.forEach(category => {
            for (var i = 65; i < 91; i++) {
                if(category.category_en_name?.[0]?.toUpperCase() == String.fromCharCode(i)) {
                    let bigCateIdx = bigCategoryGroup.findIndex(obj => obj.label === String.fromCharCode(i))
                    if(bigCateIdx === -1) {
                        // 대분류 카테고리에 없는 경우
                        bigCategoryGroup.push({
                            'label' : String.fromCharCode(i),
                            'childs' : [
                                category,
                            ]
                        })
                    }
                    else {
                        // 대분류 카테고리에 이미 존재하는 경우
                        bigCategoryGroup[bigCateIdx].childs.push(category)
                    }
                }
            }
        })
        // unKnownCategory 추가
        categories?.forEach(category => {
            if(isAddCategory(category, bigCategoryGroup) === false)
                unKnownCategory.childs.push(category)
        })
        // bigCategoryGroup chuld 정렬
        bigCategoryGroup.forEach(category => {
            category.childs.sort((a, b) => a.category_en_name.localeCompare(b.category_en_name))
        })
        
        return [
            ...bigCategoryGroup.sort((a, b) => a.label.localeCompare(b.label)),
            unKnownCategory
        ]        
    }

    return {
        SortedENG
    }
}

export const LANGCODE = {
    NOT_USE: null,
    ENG : 0,
    KOR : 1,
}

export const CategorySorter = (themeCategoryList) => {
    const initailize = () => {
        return themeCategoryList?.[1]?.product_categories?.sort((a, b) => {
            if (a.category_en_name > b.category_en_name) return 1;
            if (a.category_en_name < b.category_en_name) return -1;
            return 0;
        })
    }

    const categories = initailize()
    const { SortedKOR } = KorSorter(categories)
    const { SortedENG } = EngSorter(categories)
    const [categoryGroup, setCategoryGroup] = useState([]);

    const sort = (sortType) => {
        if(sortType == LANGCODE.ENG) {
            setCategoryGroup(SortedENG())
        }
        else if(sortType == LANGCODE.KOR) {
            setCategoryGroup(SortedKOR())
        }
        else {
            setCategoryGroup(themeCategoryList[1])
        }
    }

    return {
        sort, categoryGroup
    }
}