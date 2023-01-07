import Axios from "axios"
import React, { useState, useRef } from "react"

function CreateNewForm(props) {
  const [Name, setName] = useState("")
  const [Role, setRole] = useState("")
  const [file, setFile] = useState("")
  const CreatePhotoField = useRef()

  async function submitHandler(e) {
    e.preventDefault()
    const data = new FormData()
    data.append("photo", file)
    data.append("Name", Name)
    data.append("Role", Role)
    setName("")
    setRole("")
    setFile("")
    CreatePhotoField.current.value = ""
    const newPhoto = await Axios.post("/create-cricketer", data, { headers: { "Content-Type": "multipart/form-data" } })
    props.setCricketers(prev => prev.concat([newPhoto.data]))
  }

  return (
    <form className="p-3 bg-success bg-opacity-25 mb-5" onSubmit={submitHandler}>
      <div className="mb-2">
        <input ref={CreatePhotoField} onChange={e => setFile(e.target.files[0])} type="file" className="form-control" />
      </div>
      <div className="mb-2">
        <input onChange={e => setName(e.target.value)} value={Name} type="text" className="form-control" placeholder="Cricketer name" />
      </div>
      <div className="mb-2">
        <input onChange={e => setRole(e.target.value)} value={Role} type="text" className="form-control" placeholder="Role" />
      </div>

      <button className="btn btn-success">Add New Cricketer!</button>
    </form>
  )
}

export default CreateNewForm