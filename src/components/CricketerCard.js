import Axios from "axios"
import React, { useState } from "react"

function CricketerCard(props) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftName, setDraftName] = useState("")
  const [file, setFile] = useState()
  const [draftRole, setDraftRole] = useState("")

  async function submitHandler(e) {
    e.preventDefault()
    setIsEditing(false)
    props.setCricketers(prev =>
      prev.map(function (cricketer) {
        if (cricketer._id == props.id) {
          return { ...cricketer, Name: draftName, Role: draftRole}
        }
        return cricketer
      })
    )
    const data = new FormData()
    if (file) {
      data.append("photo", file)
    }
    data.append("_id", props.id)
    data.append("Name", draftName)
    data.append("Role", draftRole)
    const newPhoto = await Axios.post("/update-cricketer", data, { headers: { "Content-Type": "multipart/form-data" } })
    if (newPhoto.data) {
      props.setCricketers(prev => {
        return prev.map(function (cricketer) {
          if (cricketer._id == props.id) {
            return { ...cricketer, photo: newPhoto.data }
          }
          return cricketer
        })
      })
    }
  }

  return (
    <div className="card">
      <div className="our-card-top">
        {isEditing && (
          <div className="our-custom-input">
            <div className="our-custom-input-interior">
              <input onChange={e => setFile(e.target.files[0])} className="form-control form-control-sm" type="file" />
            </div>
          </div>
        )}
        <img src={props.photo ? `/uploaded-photos/${props.photo}` : "/fallback.png"} className="card-img-top" alt={`${props.Role} named ${props.Name}`} />
      </div>
      <div className="card-body">
        {!isEditing && (
          <>
            <h4>{props.Name}</h4>
            <p className="text-muted small">{props.Role}</p>
            {!props.readOnly && (
              <>
                <button
                  onClick={() => {
                    setIsEditing(true)
                    setDraftName(props.Name)
                    setDraftRole(props.Role)
                    setFile("")
                  }}
                  className="btn btn-sm btn-primary"
                >
                  Edit
                </button>{" "}
                <button
                  onClick={async () => {
                    const test = Axios.delete(`/cricketer/${props.id}`)
                    props.setCricketers(prev => {
                      return prev.filter(cricketer => {
                        return cricketer._id != props.id
                      })
                    })
                  }}
                  className="btn btn-sm btn-outline-danger"
                >
                  Delete
                </button>
              </>
            )}
          </>
        )}
        {isEditing && (
          <form onSubmit={submitHandler}>
            <div className="mb-1">
              <input autoFocus onChange={e => setDraftName(e.target.value)} type="text" className="form-control form-control-sm" value={draftName} />
            </div>
            <div className="mb-2">
              <input onChange={e => setDraftRole(e.target.value)} type="text" className="form-control form-control-sm" value={draftRole} />
            </div>
            <button className="btn btn-sm btn-success">Save</button>{" "}
            <button onClick={() => setIsEditing(false)} className="btn btn-sm btn-outline-secondary">
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default CricketerCard