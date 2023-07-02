import ManagerLayout from "src/layouts/manager/ManagerLayout";
import OrganizationalChart from 'src/components/organizational-chart';
import { test_categories } from "src/data/test-data";
import { useEffect, useState } from "react";
import styled from "styled-components";

const Wrappers = styled.div`
width:100%;
overflow-x:auto;
`
const CategoryList = () => {
  const [categories, setCategories] = useState({});

  useEffect(() => {

    setCategories({
      category_name: '카테고리',
      children: renameCategoryName(test_categories)
    })
  }, [])
  function renameCategoryName(categories) {
    return categories.map(category => {
      const { category_name, ...rest } = category;
      return { name: category_name, ...rest, children: renameCategoryName(category.children) };
    });
  }
  return (
    <>
      <Wrappers>
        <OrganizationalChart data={categories} variant="standard" lineHeight="40px" />
      </Wrappers>
    </>
  )
}
CategoryList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default CategoryList
