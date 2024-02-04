import styled from "styled-components";
import { logoSrc } from "src/data/data";

const Wrappers = styled.div`
max-width:1250px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
text-align: center;
`

const CompanyGuide = () => {
    return (
        <>
        <Wrappers>
            <img src="/grandparis/company_info_1.png" style={{width:'1018px', margin:'0 auto'}} />
            <img src="/grandparis/company_info_2.png" style={{width:'1018px', margin:'0 auto'}} />
            <img src="/grandparis/company_info_3.png" style={{width:'1018px', margin:'0 auto'}} />
        </Wrappers>
        </>
    )
}

export default CompanyGuide