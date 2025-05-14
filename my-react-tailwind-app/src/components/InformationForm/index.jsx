import { useState } from "react";
import axios from "axios";
const InformationForm = ()=>{

    const [formData,setFormData] = useState({
          name:"",
          study:"",
          photo:null
    });

    const [message,setMessage]=useState('');

    const handleSubmit = async()=>{


        try{

             const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('study', formData.study);
            if (formData.photo) {
                formDataToSend.append('photo', formData.photo);
            }
            console.log(formData);
                const response = await axios.post("http://localhost:5000/api/infoData",
                    formDataToSend,
                {
                    headers:{
                        'Content-Type':'multipart/form-data'
                    }
                });

                if(response.data.ok)
                {  
                    setMessage("Information submitted successfully..");
                    setFormData({name:"",study:"",photo:null})
                }
        }catch(error)
        {
            console.log(error);
        }
    }

    return (
        <>
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                    { message && (
                        <div className="p-3 rounded-md text-center mb-4 ">
                            {message}
                        </div>
                    )}
                      <h1 className="text-2xl font-bold text-center mb-6">Submit Information</h1>
                         <form  onSubmit={(e)=>{
                              e.preventDefault();
                              handleSubmit();
                         }}>
                           <div className="mb-4">
                             <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                             <input
                               type="text"
                               id="name"
                               name="name"
                               value={formData?.name}
                               onChange={(e)=>setFormData({...formData,name:e.target.value})}
                               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                               required
                             />
                           </div>
                           <div className="mb-4">
                             <label htmlFor="study" className="block text-sm font-medium text-gray-700">Field of Study</label>
                             <input
                               type="text"
                               id="study"
                               name="study"
                               value={formData?.study}
                               onChange={(e)=>setFormData({...formData,study:e.target.value})}
                               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                               required
                             />
                           </div>
                           <div className="mb-4">
                             <label htmlFor="photo" className="block text-sm font-medium text-gray-700">Photo</label>
                             <input
                               type="file"
                               id="photo"
                               name="photo"
                               accept="image/*"
                                onChange={(e)=>setFormData({...formData,photo:e.target.files[0]})}
                               className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                               required
                             />
                           </div>
                            <button
                              type="submit"
                              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              Submit
                            </button>
                          </form>
                          <div  className="mt-4 text-green-600 hidden"></div>
                          <div  className="mt-4 text-red-600 hidden"></div>
            </div>
        </>
    )
};

export default InformationForm;