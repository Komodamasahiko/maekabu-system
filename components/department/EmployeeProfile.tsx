'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Building,
  Edit2,
  Save,
  X,
  LogOut,
  Camera,
  Trash2,
} from 'lucide-react'

interface ProfileData {
  display_name: string
  email: string
  phone_number: string
  birth_date: string
  address: string
  skills: string
  qualifications: string
  specialties: string
  hobbies: string
  department_name?: string
  position?: string
  profile_photo_url?: string
  employee_code?: string
  employee_number?: string
}

interface EmployeeProfileProps {
  departmentCode: 'live_dep' | 'fan_dep' | 'afe_dep'
  departmentName: string
  themeColor: string
}

export default function EmployeeProfile({ departmentCode, departmentName, themeColor }: EmployeeProfileProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [employee, setEmployee] = useState<any>(null)
  const [profileData, setProfileData] = useState<ProfileData>({
    display_name: '',
    email: '',
    phone_number: '',
    birth_date: '',
    address: '',
    skills: '',
    qualifications: '',
    specialties: '',
    hobbies: '',
  })
  const [editData, setEditData] = useState<ProfileData>({...profileData})
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  useEffect(() => {
    loadProfileData()
  }, [])

  const loadProfileData = async () => {
    try {
      const response = await fetch('/api/auth/check-session')
      const sessionData = await response.json()
      
      if (!sessionData.authenticated) {
        router.push(`/${departmentCode}/login`)
        return
      }

      const emp = sessionData.employee
      setEmployee(emp)
      
      const data: ProfileData = {
        display_name: emp.display_name || emp.first_name + ' ' + emp.last_name || '',
        email: emp.email || '',
        phone_number: emp.phone_number || '',
        birth_date: emp.birth_date || '',
        address: emp.address || '',
        skills: emp.skills || '',
        qualifications: emp.qualifications || '',
        specialties: emp.specialties || '',
        hobbies: emp.hobbies || '',
        department_name: emp.department || departmentName,
        position: emp.position || '',
        profile_photo_url: emp.profile_photo_url || '',
        employee_code: emp.employee_code || '',
        employee_number: emp.employee_number || emp.employee_code || '',
      }

      setProfileData(data)
      setEditData(data)
      setPhotoUrl(emp.profile_photo_url || null)
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditing(true)
    setEditData({...profileData})
  }

  const handleCancel = () => {
    setEditing(false)
    setEditData({...profileData})
  }

  const handleSave = async () => {
    setSaveStatus('saving')
    
    try {
      const response = await fetch(`/api/employees/${employee.id}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills: editData.skills,
          qualifications: editData.qualifications,
          specialties: editData.specialties,
          hobbies: editData.hobbies,
        }),
      })
      
      if (response.ok) {
        setProfileData(editData)
        setEditing(false)
        setSaveStatus('success')
        
        setTimeout(() => {
          setSaveStatus('idle')
        }, 3000)
      } else {
        throw new Error('Save failed')
      }
    } catch (error) {
      console.error('Save error:', error)
      setSaveStatus('error')
      
      setTimeout(() => {
        setSaveStatus('idle')
      }, 3000)
    }
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingPhoto(true)
    
    try {
      const formData = new FormData()
      formData.append('photo', file)
      
      const response = await fetch(`/api/employees/${employee.id}/photo`, {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        setPhotoUrl(result.photoUrl)
        setProfileData(prev => ({ ...prev, profile_photo_url: result.photoUrl }))
      }
    } catch (error) {
      console.error('Photo upload error:', error)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handlePhotoDelete = async () => {
    if (!confirm('プロフィール写真を削除しますか？')) return
    
    setUploadingPhoto(true)
    
    try {
      const response = await fetch(`/api/employees/${employee.id}/photo`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setPhotoUrl(null)
        setProfileData(prev => ({ ...prev, profile_photo_url: '' }))
      }
    } catch (error) {
      console.error('Photo delete error:', error)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push(`/${departmentCode}/login`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`bg-gradient-to-r ${themeColor} rounded-lg shadow-lg p-6 mb-8`}>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              {/* Profile Photo */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-white shadow-md">
                  {photoUrl ? (
                    <img src={photoUrl} alt={profileData.display_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="photo-upload"
                  type="file"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                />
                <label htmlFor="photo-upload">
                  <button
                    className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-50 cursor-pointer"
                    disabled={uploadingPhoto}
                  >
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                </label>
                {photoUrl && (
                  <button
                    onClick={handlePhotoDelete}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                    disabled={uploadingPhoto}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Name and Info */}
              <div className="text-white">
                <h1 className="text-2xl font-bold">{profileData.display_name}</h1>
                <p className="text-sm opacity-90">{profileData.employee_number}</p>
                <p className="text-sm opacity-90">{profileData.department_name}</p>
                {profileData.position && (
                  <p className="text-sm opacity-90">{profileData.position}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              {!editing ? (
                <>
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow hover:bg-gray-50 transition flex items-center space-x-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>編集</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-white/20 text-white rounded-lg shadow hover:bg-white/30 transition flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>ログアウト</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                    className="px-4 py-2 bg-white text-green-600 rounded-lg shadow hover:bg-gray-50 transition flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saveStatus === 'saving' ? '保存中...' : '保存'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-white/20 text-white rounded-lg shadow hover:bg-white/30 transition flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>キャンセル</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {saveStatus === 'success' && (
          <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded-lg">
            <p className="text-green-700">プロフィールを更新しました</p>
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700">更新に失敗しました</p>
          </div>
        )}

        {/* Profile Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-gray-500" />
              基本情報
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">メールアドレス</label>
                <div className="flex items-center mt-1">
                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                  <p className="text-gray-900">{profileData.email || '未設定'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">電話番号</label>
                <div className="flex items-center mt-1">
                  <Phone className="w-4 h-4 text-gray-400 mr-2" />
                  <p className="text-gray-900">{profileData.phone_number || '未設定'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">住所</label>
                <div className="flex items-center mt-1">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                  <p className="text-gray-900">{profileData.address || '未設定'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">生年月日</label>
                <div className="flex items-center mt-1">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <p className="text-gray-900">{profileData.birth_date || '未設定'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Skills and Qualifications */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-gray-500" />
              スキル・資格
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">スキル</label>
                {editing ? (
                  <textarea
                    value={editData.skills}
                    onChange={(e) => setEditData({...editData, skills: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="プログラミング、デザイン..."
                  />
                ) : (
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{profileData.skills || '未設定'}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-500">資格</label>
                {editing ? (
                  <input
                    type="text"
                    value={editData.qualifications}
                    onChange={(e) => setEditData({...editData, qualifications: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="資格名..."
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{profileData.qualifications || '未設定'}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-500">専門分野</label>
                {editing ? (
                  <input
                    type="text"
                    value={editData.specialties}
                    onChange={(e) => setEditData({...editData, specialties: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="専門分野..."
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{profileData.specialties || '未設定'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Hobbies */}
          <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2 text-gray-500" />
              趣味・その他
            </h2>
            <div>
              <label className="text-sm text-gray-500">趣味</label>
              {editing ? (
                <textarea
                  value={editData.hobbies}
                  onChange={(e) => setEditData({...editData, hobbies: e.target.value})}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="読書、スポーツ..."
                />
              ) : (
                <p className="mt-1 text-gray-900 whitespace-pre-wrap">{profileData.hobbies || '未設定'}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}