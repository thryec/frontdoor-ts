import React, {useState, useContext, useEffect, useRef} from 'react';
import { useRouter } from 'next/router';
import UserContext from '../context/LoginState';
import NotLoggedIn from "../components/userNotLoggedin";
import jwtDecode from 'jwt-decode';

const Sell = () => {
  const router = useRouter();
  const userLoginState = useContext(UserContext);

  const checkLoginStatus = () => {
    let token = localStorage.getItem('token');
    if (token) {
      userLoginState.setLoginState(true);
    }
  }

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const refName = useRef<any>();
  const refDescription = useRef<any>();
  const refImage = useRef<any>();
  const refPrice = useRef<any>();

  const [input, setInput] = useState<any>({
    name : "",
    description : "",
    image : "",
    price : 0,
  });
  const [nameEmpty, setNameEmpty] = useState<boolean | null>(null);
  const [descriptionEmpty, setDescriptionEmpty] = useState<boolean | null>(null);
  const [imageEmpty, setImageEmpty] = useState<boolean | null>(null);
  const [priceEmpty, setPriceEmpty] = useState<boolean | null>(null);

  const handleChange = (event: any) => {
    const label = event.target.name;
    const value = event.target.value;
    // console.log("this is the input: ", input)
    setInput({...input, [label]:value})
  }

  const verifyPrice = () => {
    const re = /^\d{0,6}(\.\d{1,2})?$|^\d{0,2}(\.\d{1,4})?$/;
    const isNumber = re.test(input.price);
    return isNumber
  }
  
  ////to check if fields are empty
  const handleNameBlur = (): void => {
    !refName.current.value ? setNameEmpty(true) : setNameEmpty(false)
    // console.log("this is nameblur: ", nameEmpty)
  }
  const handleDescriptionBlur = (): void => {
    !refDescription.current.value ? setDescriptionEmpty(true) : setDescriptionEmpty(false)
    // console.log("this is descpblur: ", descriptionEmpty)
  }
  const handleImageBlur = (): void => {
    !refImage.current.value ? setImageEmpty(true) : setImageEmpty(false)
    // console.log("this is imageblur: ", imageEmpty)
  }
  const handlePriceBlur = (): void => {
    !refPrice.current.value ? setPriceEmpty(true) : setPriceEmpty(false)
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    let token: string | null = localStorage.getItem('token');
    if (input.name && input.description && input.image && input.price && verifyPrice() && token) {
      let decodedToken: any = jwtDecode(token);
      let sellerWallet = decodedToken.walletAddress;
      let newItem = {...input, seller: sellerWallet};

      try {
        const res = await fetch(`${process.env.API_ENDPOINT}/items`, {
          method: 'POST',
          body: JSON.stringify(newItem),
          headers: {
            'Content-Type': 'application/json',
          }
        })
        const data : any = await res.json();
        router.push(`/items/${data._id}`);
      } catch (err) {
        console.log(err);
        router.push("/failedlisting");
      }
    }
  }

  return (
    <>
      {userLoginState.isLoggedIn ? (
        <>
          <h1 className="ml-10">List Item Here</h1>
          <form onSubmit={handleSubmit}>
            <label htmlFor='name'>Listing Title: </label>
            <input type="text" name="name" ref={refName} onChange={handleChange} onBlur={handleNameBlur}></input><br/>
            {nameEmpty ? <h1>Please enter listing title</h1> : ""}

            <label htmlFor='description'>Description: </label>
            <input type="text" name="description" ref={refDescription} onChange={handleChange} onBlur={handleDescriptionBlur}></input><br/>
            {descriptionEmpty ? <h1>Please enter listing description</h1> : ""}

            <label htmlFor='image'>Image URL: </label>
            <input type="text" name="image" ref={refImage} onChange={handleChange} onBlur={handleImageBlur}></input><br/>
            {imageEmpty ? <h1>Please enter listing image</h1> : ""}

            <label htmlFor='price'>Price (ETH): </label>
            <input type="text" name="price" ref={refPrice} onChange={handleChange} onBlur={handlePriceBlur}></input><br/>
            {priceEmpty ? <h1>Please enter listing price</h1> : ""}
            {verifyPrice() ? true : <h1>Please enter price in numbers</h1>}
            
            <input type="submit" value="List Item"/>
          </form>
        </>
      ) : <NotLoggedIn/>}
    </>
  )
}

export default Sell
